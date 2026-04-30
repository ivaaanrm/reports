import mistune
from mistune.plugins.table import table
from mistune.plugins.task_lists import task_lists

_md = mistune.Markdown(renderer=None, plugins=[table, task_lists])


def parse(text: str) -> list[dict]:
    tokens, _ = _md.parse(text)
    return tokens
