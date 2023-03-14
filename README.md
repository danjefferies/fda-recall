# fda-recall

This is a dashbard of the latest FDA recalls, using Leaflet.js to create a map and D3 to manipulate the DOM.

This project works by pinging the FDA recalls API, which is updated whenever an update is made to any report. In this case, we specify which state we want, how many entries, and whether those are old or new. For each state, the link should be comprised of a base URL (https://api.fda.gov/food/enforcement.json?search=state:), followed by the two-letter state abbreviation, and closed with the sorting terms (&sort=report_date:desc&limit=5). The cards on the right side of the page update dynamically with the five most recent recalls for each state.

By Danica Jefferies and Jovi Dai for JRNL 5500: Coding for Digital Storytelling, Northeastern University.
