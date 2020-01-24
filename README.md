# Welcome to the FlavorDome!
------
## About FlavorDome
  FlavorDome is a social experience application. The goal of FlavorDome is to provide a
group taste-testing experience. FlavorDome is crafted so that all participants can engage in the
experience without knowing which product they're tasting at any given time, so as to ensure
an objective rating.

  FlavorDome guides the users through a simultaneous taste-testing experience, culminating in
head-to-head showdowns between the highest rated products to crown an ultimate champion.
Users then have the actual names of the products revealed to them, before being given the option
to send themselves an email containing the results of the taste-test.

## Technology Used
  FlavorDome was created using Django for the backend, with Django Channels and Redis providing the
channel layer for the websockets used to implement the multiplayer experience. FlavorDome's frontend was
crafted using Vue, with Vuex interacting with the websockets to ensure that all participants move through
the experience simultaneously and share their ratings in real time. This frontend was bundled and served
utilizing webpack.

## Want to check it out for yourself?
  Flavordome is up and running at https://flavordome.herokuapp.com. FlavorDome was built as a mobile-first
application. For the best experience, we recommend using your smartphone.