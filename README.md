# Reform of Life

Four short guides to ordinary Catholic practice, written for someone starting
or starting again: the Rosary, the Gospels, Confession, and the Mass.

A plain static site. No build step, no dependencies, no JavaScript except the
small script that draws the rosary diagram. Open `index.html` in a browser and
it works.

## Pages

| File | |
|---|---|
| `index.html` | Landing page; the four practices and their rhythms |
| `rosary.html` | The beads, the walkthrough, all twenty mysteries, every prayer |
| `gospels.html` | The four Gospels, how to read slowly, a first month in Mark |
| `confession.html` | What to do beforehand, exactly what to say, the Act of Contrition |
| `mass.html` | The shape of the Mass, postures, the responses, communion |
| `style.css` | Shared styles for all five pages |

## The design

It follows the rubric tradition of missals and breviaries: instructions print
in red, the prayers themselves in black. That is where the word "rubric" comes
from, and it happens to encode exactly the distinction a beginner needs, which
is the difference between what you say and what you do.

Two typefaces, doing two different jobs. EB Garamond carries everything you
read or pray; it descends from the faces liturgical books have been set in for
four centuries. Archivo, small and letterspaced, carries everything that
instructs: labels, step numbers, the apparatus.

Every page is built to be printed. There is a print stylesheet that forces the
paper palette regardless of the reader's theme, keeps each section whole across
a page break, and drops the navigation, so any page can be turned into a PDF
and handed to somebody.

## Editing

Plain HTML. To change wording, open the file and change the wording.

- Prayers and anything quoted verbatim go in `<p class="said">` or inside a
  `.prayer` block, which gives them the sunken panel and the red rule.
- Numbered walkthroughs use `<ol class="walk">`, with a red `.step-do` line
  saying what happens and a `.step-say` paragraph saying what you say.
- Colors are CSS custom properties at the top of `style.css` and are defined
  three times: once for light, once for the system dark preference, once for an
  explicit dark choice. Change all three or the page will look wrong in one of
  them.
