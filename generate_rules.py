import json
import os
import urllib.request

SOURCES = {
    "base": "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
    "porn": "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn/hosts",
    "gambling": "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/gambling/hosts",
    "fakenews": "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/fakenews/hosts",
    "social": "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/social/hosts",
}

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rules")
HOST_PREFIXES = ("0.0.0.0", "127.0.0.1")
IGNORED_HOSTS = {"0.0.0.0", "127.0.0.1", "localhost", "broadcasthost"}


def parse_hosts(content):
    domains = set()
    for line in content.splitlines():
        parts = line.split("#", 1)[0].strip().split()
        if len(parts) >= 2 and parts[0] in HOST_PREFIXES:
            domain = parts[1].lower().rstrip(".")
            if domain not in IGNORED_HOSTS:
                domains.add(domain)
    return domains


def normalize_domains(domains):
    return {domain[4:] if domain.startswith("www.") else domain for domain in domains}


def download_and_parse(url):
    print(f"\nDescargando datos de {url}...")
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(request) as response:
            return parse_hosts(response.read().decode("utf-8"))
    except Exception as error:
        raise RuntimeError(f"Error descargando {url}: {error}") from error


def compress_domains(domains):
    print("  [+] Optimizando dataset: Eliminando redundancias...")
    normalized = normalize_domains(domains)

    final_domains = set()
    for domain in normalized:
        parts = domain.split(".")
        if not any(".".join(parts[index:]) in normalized for index in range(1, len(parts) - 1)):
            final_domains.add(domain)

    print(f"  [+] Reducción: de {len(domains)} a {len(final_domains)} dominios activos.")
    return sorted(final_domains)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    downloaded_lists = {
        category: download_and_parse(url) for category, url in SOURCES.items()
    }
    base_source_domains = normalize_domains(downloaded_lists["base"])
    generated_lists = {"base": compress_domains(base_source_domains)}

    for category, domains in downloaded_lists.items():
        if category == "base":
            continue
        category_only_domains = normalize_domains(domains) - base_source_domains
        generated_lists[category] = compress_domains(category_only_domains)
        print(f"  [+] Dominios exclusivos de {category}: {len(generated_lists[category])}")

    for category, domains in generated_lists.items():
        output_file = os.path.join(OUTPUT_DIR, f"list_{category}.json")
        with open(output_file, "w", encoding="utf-8") as output:
            json.dump(domains, output, ensure_ascii=False, separators=(",", ",:"))
        print(f"  --> Archivo maestro generado: {output_file} (Dominios: {len(domains)})")


if __name__ == "__main__":
    main()
