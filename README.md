Scroller
=============

What
----
A method of scrolling big elements quickly.

Why
---
Because draggables or scrolling takes too long

How
---
Currently using jQuery. CSS Transitions are being worked on.
Apply like this:
```html
<script src="./libs/jquery.js"></script>
<script src="./src/jquery.scroller.js"></script>
<script>
    $('#element').scroller();
</script>
```

How?!
-----
A line between the start trigger and move trigger coordinates is created, finding at what X, Y coordinate the line will touch the end of the element. jQuery Animate is used to navigate to that line.

CSS transitions are currently written, however performance isn't great. This will be assessed.
Who
---
Concept & Implementation: www.joeao.co.uk
Math: http://scholar.google.com.au/citations?user=BV5PkWUAAAAJ&hl=de

Todo
----
As the plugin finds the end point, if the element is already position