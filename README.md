Scroller
=============
Scroller provides a different method of scrolling using jQuery. You may have seen this kind of scrolling clicking the middle-mouse button in an application with overflow X and Y.

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
A line between the start trigger and move trigger coordinates is created, finding at what X, Y coordinate the line will touch the end of the element. jQuery Animate is used to navigate to that point.

CSS transitions are currently written, however performance isn't great. This will be assessed.

Who
---
Concept & Implementation: JoeAO - www.joeao.co.uk

Math Expertise: Peter Straka - http://scholar.google.com.au/citations?user=BV5PkWUAAAAJ&hl=de

Todo
----
As the plugin finds the end point, if the element is already position at this point, you'll have to navigate in the opposite direction to move.