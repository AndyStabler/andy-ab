# Hold tight! This is currently under development.

# Andy AB

Behold, an AB testing framework for static sites without any frills.

## Example
```html
<head>
  <script src="/assets/js/andy-ab.min.js"></script>
  <script>
    var test = new AndyAB("example_test")
    .withCohorts(["control", "treatment"])
    .enrol(function(cohort){
      console.log("Enrolled into " + cohort + " cohort. Great!");
      // Fire analytics events here
    })
    .whenIn("treatment", "#price", function(element) {
      element.innerHTML = "&pound;5";
    })
    .whenIn("treatment", "#price-description", function(element) {
      element.innerHTML = "It's cheap, but so are you!";
    })
    .whenIn("treatment", function() {
      // Fire analytics event to signal treatment page viewed.
      // Or perform a redirect for users in a certain cohort
      // e.g. document.location.href = "http://www.google.com";
    });
  </script>
  <link rel="stylesheet" type="text/css" href="assets/css/main.css">
</head>
<body>
  <h1 id="price">&pound;20</h1>
  <p id="price-description">It's expensive, but so are you!</p>
</body>
```

## FAQ

### How many cohorts can I have?

How many can you shake a stick at? (as many as you like).

### Can I run redirect experiments?

Sure can. Try this out:
```javascript
test.whenIn("treatment", function() {
  document.location.href = "other_home_page";
});
```

### In your example you're including JS in the HEAD section, isn't that bad?

This _could_ slow down the time it takes your page to load. However, it was a conscious
decision since it will prevent the page from flickering.

This is because the testing framework listens to the DOM as it loads and executes
callbacks before the elements are rendered on the page. This prevents a flicker
occuring on the page when elements are updated. For example, say you were running an experiment where users in the control cohort saw a green button, and users in
the treatment cohort saw a blue button. You'd say something like:

```javascript
test.whenIn("treatment", "#my-button", function(element) {
  element.style.background="blue";
});
```

If the script was at the _bottom_ of the page, then the green control button would
be rendered first, _then_ the script would execute where the background colour would
be set to blue. This would sometimes be noticable and potentially affect your experiment
results.

## Try it out
```
brew install node
npm install -g grunt-cli
npm install
grunt http-server
```

## How to maintain it

1. Fork the repo
2. Create a branch `git checkout -b my-cool-branch`
3. Run `npm install`
4. Cut code ✨
5. Build it and run the tests `grunt`
6. Create a Pull Request
