import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import generate_rules


class GenerateRulesTests(unittest.TestCase):
    def test_parse_hosts_ignores_comments_and_unsupported_mappings(self):
        content = """
            # comment
            0.0.0.0 www.Example.com # comment
            127.0.0.1 child.example.com
            127.0.0.1 localhost
            192.168.1.1 ignored.example.com
        """
        self.assertEqual(generate_rules.parse_hosts(content), {"www.example.com", "child.example.com"})

    def test_compress_domains_normalizes_and_sorts(self):
        domains = {"www.example.com", "child.example.com", "other.net"}
        self.assertEqual(generate_rules.compress_domains(domains), ["example.com", "other.net"])

    def test_category_delta_keeps_non_base_subdomains(self):
        base_domains = generate_rules.normalize_domains({"base.example", "www.shared.example"})
        category_domains = generate_rules.normalize_domains(
            {"base.example", "adult.base.example", "www.shared.example", "category.example"}
        ) - base_domains
        self.assertEqual(
            generate_rules.compress_domains(category_domains),
            ["adult.base.example", "category.example"],
        )

    def test_all_categories_have_stevenblack_sources(self):
        self.assertEqual(set(generate_rules.SOURCES), {"base", "porn", "gambling", "fakenews", "social"})
        self.assertTrue(all("StevenBlack/hosts" in url for url in generate_rules.SOURCES.values()))

    @patch("generate_rules.urllib.request.urlopen")
    def test_download_and_parse_uses_hosts_parser(self, mock_urlopen):
        mock_urlopen.return_value.__enter__.return_value.read.return_value = b"0.0.0.0 example.com\n"
        self.assertEqual(generate_rules.download_and_parse("https://example.test/hosts"), {"example.com"})

    def test_failed_download_does_not_write_partial_lists(self):
        with TemporaryDirectory() as output_dir:
            with patch.object(generate_rules, "OUTPUT_DIR", output_dir), patch(
                "generate_rules.download_and_parse", side_effect=RuntimeError("offline")
            ):
                with self.assertRaisesRegex(RuntimeError, "offline"):
                    generate_rules.main()
            self.assertEqual(list(Path(output_dir).iterdir()), [])


if __name__ == "__main__":
    unittest.main()
