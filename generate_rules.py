import urllib.request
import json
import os

SOURCES = {
    "porn": "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts",
    "gambling": "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/gambling-only/hosts",
    "fakenews": "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/fakenews-only/hosts"
}

OUTPUT_DIR = "./rules"

def download_and_parse(url):
    print(f"\nDescargando datos de {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
    except Exception as e:
        print(f"Error descargando {url}: {e}")
        return []

    domains = set()
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("0.0.0.0") or line.startswith("127.0.0.1"):
            clean_line = line.split('#')[0].strip()
            parts = clean_line.split()
            if len(parts) >= 2:
                domain = parts[1]
                if domain not in ["0.0.0.0", "localhost", "broadcasthost"]:
                    domains.add(domain)
    return list(domains)

def compress_domains(domains):
    print("  [+] Optimizando dataset: Eliminando redundancias...")
    normalized = set()
    for d in domains:
        if d.startswith('www.'):
            normalized.add(d[4:])
        else:
            normalized.add(d)
    
    final_domains = set()
    for domain in normalized:
        parts = domain.split('.')
        is_subdomain = False
        for i in range(1, len(parts) - 1):
            parent = '.'.join(parts[i:])
            if parent in normalized:
                is_subdomain = True
                break
        if not is_subdomain:
            final_domains.add(domain)
            
    print(f"  [+] Reducción: de {len(domains)} a {len(final_domains)} dominios activos.")
    return list(final_domains)

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    for category, url in SOURCES.items():
        raw_domains = download_and_parse(url)
        compressed_domains = compress_domains(raw_domains)
        
        output_file = os.path.join(OUTPUT_DIR, f"list_{category}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(compressed_domains, f)
            
        print(f"  --> Archivo maestro generado: {output_file} (Dominios: {len(compressed_domains)})")

if __name__ == "__main__":
    main()