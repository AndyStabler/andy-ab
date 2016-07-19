# Andy AB

Behold, an AB testing framework without any frills.

## How to use it
```html
<head>
  <script src="/assets/js/andyAb.js"></script>
  <script>
    var test = new AndyAB("My super awesome test")
      .withCohorts(["control", "treatment"])
      .endingAtTime(new Date("August 1, 2016 12:00:00"))
      .enrol(function(cohort){
        console.log("Enrolled into " + cohort + " cohort. Great!");
        // Fire analytics events here
      });

    test.updateForCohort("treatment", "#price", function(element) {
      element.innerHTML = "&pound;5";
    });

    test.updateForCohort("treatment", "#price-description", function(element) {
      element.innerHTML = "It's cheap, but so are you!";
    });

  </script>
</head>
<body>
  <h1 id="price">&pound;20</h1>
  <p id="price-description">It's expensive, but so are you!</p>
</body>
```
The first time this script is executed, the user will be enrolled into either the control or treatment cohort.
When this happens a cookie is created that stores the cohort the user is in, so next time they load the page they'll still be in that cohort. `"Enrolled into " + cohort + " cohort. Great!"` will also be printed to the console in this case, since that's what we specified in the enrol callback. This would be a good place to fire off some analytics events.


If you have `node` installed you can see an example in action by executing `npm run start`.

## How to maintain it

1. Fork the repo
2. Create a branch `git checkout -b my-cool-branch`
3. Run `npm install`
4. Cut code ✨
5. Check it works `npm run test`
6. Create a Pull Request
