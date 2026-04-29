import mistune
from mistune.plugins.table import table

_md = mistune.Markdown(renderer=None, plugins=[table])


def parse(text: str) -> list[dict]:
    tokens, _ = _md.parse(text)
    return tokens
