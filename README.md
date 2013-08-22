cScroll
=============
cScroll provides a different method of scrolling using jQuery. You may have seen this kind of scrolling clicking the middle-mouse button in an application with overflow X and Y.

<a target="_blank" href="cScroll.joeao.co.uk">Demo</a>

Why
---
Because draggables or scrolling takes too long on big elements.

How
---
Currently using jQuery Animate. CSS Transitions are being worked on.
Apply like this:
```html
<script src="./libs/jquery.js"></script>
<script src="./src/jquery.cScroll.js"></script>
<script>
    $('#element').cScroll();
</script>
```

Explain
-----
A line between the start trigger and move trigger coordinates is created, finding at what X/Y coordinate the line will touch the end of the element. jQuery Animate is used to navigate to that point.

CSS transitions are currently written, however performance isn't great. This will be assessed.

Who
---
Concept & Implementation: JoeAO - www.joeao.co.uk

Math Expertise: Peter Straka - http://scholar.google.com.au/citations?user=BV5PkWUAAAAJ&hl=de

Todo
----
- [ ] Handle edge of wall better
- [ ] Enable drawCursor by default, disabling if not supported. <a target="_blank"> href="http://forum.jquery.com/topic/jquery-support-leadingwhitespace-is-not-working-in-jquery-2-x">http://forum.jquery.com/topic/jquery-support-leadingwhitespace-is-not-working-in-jquery-2-x</a>