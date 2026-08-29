Feature: API testing with Playwright and Cucumber
  This feature demonstrates reusable API test steps and an API helper layer.

  Background:
    Given the API base URL is loaded from env
  #changes from the git hub
  #Set the record
  Scenario: Create a booking with reusable POST method
    When I POST "/booking" with payload file "data/bookingPayload.json"
    Then the response status should be 200
    And the JSON response should have property "booking.firstname" with value "Jim"
    And the JSON response should have property "booking.lastname" with value "Brown"
    And the JSON response should have property "booking.totalprice" with value "111"
    And the JSON response should have property "booking.depositpaid" with value "true"
    And the JSON response should have property "booking.bookingdates.checkin" with value "2018-01-01"
    And the JSON response should have property "booking.bookingdates.checkout" with value "2019-01-01"
    And the JSON response should have property "booking.additionalneeds" with value "Breakfast"
    And the JSON response should have property "booking.addon" with value "Breakfast"
    And the JSON response should have property "booking.aiite" with value "Breakfast"
