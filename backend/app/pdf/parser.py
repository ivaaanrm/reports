import mistune

_md = mistune.Markdown(renderer=None)


def parse(text: str) -> list[dict]:
    tokens, _ = _md.parse(text)
    return tokens
