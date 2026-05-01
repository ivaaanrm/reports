## Alerts

> [!NOTE]
> Useful information that users should know, even when skimming.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

> [!NOTE]
> Alerts support **bold**, *italic*, and `inline code`.
> They can span multiple lines.
>
> Even multiple paragraphs are supported.

---

## Footnotes

Here is a sentence with a footnote.[^ex1]

Another sentence references a second footnote.[^ex2]

[^ex1]: This is the first footnote content.
[^ex2]: This is a longer footnote. It can contain **formatted** text and span multiple sentences.

---

# Heading Level 1

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5

###### Heading Level 6

---

## Paragraphs and Inline Formatting

This is a regular paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use __bold__ and _italic_ with underscores.

This paragraph demonstrates `inline code`, ~~strikethrough~~, and a [hyperlink](https://example.com).

Here is a line with a hard break —
two lines separated by a trailing backslash.

---

## Blockquotes

> This is a simple blockquote.

> Blockquotes can span multiple lines
> and wrap across several sentences without issue.

> ### Nested blockquote with heading
>
> > This is a nested blockquote inside another blockquote.
> >
> > It can contain **formatted** text as well.

---

## Lists

### Unordered List

- Item one
- Item two
  - Nested item A
  - Nested item B
    - Deeply nested item
- Item three

### Ordered List

1. First item
2. Second item
   1. Nested ordered item
   2. Another nested item
3. Third item

### Mixed List

1. Ordered first
   - Unordered nested
   - Another nested bullet
2. Ordered second

---

## Code

### Inline Code

Use the `print()` function to output text in Python.

### Fenced Code Block (Python)

```python
def greet(name: str) -> str:
    """Return a greeting string."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    message = greet("World")
    print(message)
```

### Fenced Code Block (JavaScript)

```javascript
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
}
```

### Fenced Code Block (Bash)

```bash
#!/bin/bash
set -euo pipefail

for file in *.md; do
  echo "Processing $file..."
done
```

### Fenced Code Block (no language)

```
Plain preformatted text block.
No syntax highlighting applied.
    Indentation is preserved.
```

---

## Tables

| Name       | Role         | Department   | Start Date |
|------------|--------------|--------------|------------|
| Alice Chen | Engineer     | Platform     | 2021-03-15 |
| Bob Martin | Designer     | Product      | 2020-07-01 |
| Clara Diaz | Manager      | Engineering  | 2019-11-22 |
| David Park | Analyst      | Data Science | 2022-01-10 |

### Table with alignment

| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| Apple        | Banana         | Cherry        |
| 100          | 200            | 300           |
| Short        | A bit longer   | Longest entry |

---

## Horizontal Rules

Three different styles all render the same:

---

***

___

---

## Links and Images

### Links

- Inline link: [OpenAI](https://openai.com)
- Link with title: [GitHub](https://github.com "Visit GitHub")
- Bare URL: <https://example.com>
- Email: <hello@example.com>

### Reference-style Links

This uses a [reference link][ref1] and [another one][ref2].

[ref1]: https://example.com "Example Site"
[ref2]: https://example.org

### Images

![Alt text for a placeholder image](https://placehold.co/600x200/png)

---

## Task Lists

- [x] Write the markdown example file
- [x] Cover all element types
- [ ] Review the generated PDF output
- [ ] Share with the team

---

## Footnotes

Here is a sentence with a footnote.[^1]

Another sentence references a longer note.[^longnote]

[^1]: This is the first footnote.
[^longnote]: This is a longer footnote with multiple lines.
    Indented lines belong to the footnote.

---

## Definition Lists

Term One
: Definition of term one. Can span multiple sentences.

Term Two
: First definition of term two.
: Second definition of term two.

---

## Abbreviations

The HTML specification is maintained by the W3C.

*[HTML]: HyperText Markup Language
*[W3C]: World Wide Web Consortium

---

## Escaping Special Characters

Backslash escapes: \*not italic\*, \`not code\`, \[not a link\]

Literal characters: \\ \` \* \_ \{ \} \[ \] \( \) \# \+ \- \. \!

---

## Nested and Complex Structures

> **Pro tip:** You can nest almost any element inside a blockquote.
>
> ```python
> x = 42
> ```
>
> - Even lists
> - Work inside blockquotes

1. A list item with a code block inside:

   ```bash
   echo "hello from inside a list item"
   ```

2. A list item with a blockquote:

   > This quote is nested inside an ordered list item.

---

## Long Paragraph (line wrapping)

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.
