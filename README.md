Inventory management system


Group: 37
Name:
Ng Man Kwan (12661630),
Lau Lok Lam (12661235),
Tsang Tsz Yui (12661296)


Application link: https://………


********************************************
# Login
In the login interface, user can login to their account by entering their own userid and password.


Each user has a userID and password;
[
    {userid: user1, password: password1},
    {userid: user2, password: password2},
    {userid: user3, password: password3}


]


After successful login, userid will be stored in session.


********************************************
# Logout
A logout button is provided on the home page, user can logout by clicking the logout button.


********************************************
# CRUD service
- Create
Create operation is post request, and all information is in the body of request, the request form is in /create page accessed from create button in home page.


-   An item have these attributes:
    1)  id (0001), string, unique
    2)  name (coke), string
    3)  description (yummy), string, optional
    4)  category (drinks), string
    5)  quantity (9), integers


Almost all attributes are mandatory, except description is optional.


********************************************
# CRUD service
- Read
-  Accessing the home page(/home) has a read function listing all items, there is another read function in the search page(/search) using attributes like id, name, category, or quantity to search.


1) List all items information
    home.ejs will be displayed with all items with its attributes;
    home.ejs also display items count and total quantity currently have;


2) Searching by attributes
    input exact id/name/category of items you want to find (0002);
    or input quantity with >= or <= operator options to find items with  desired quantity;


********************************************
# CRUD service
- Update
-   After searching for items, the user can see all item details displayed on the details page, by typing one item id and clicking update button, the user will be directed to the update page.
-   The user can update the item information through the update page.
-   Only quantity value can be changed 


********************************************
# CRUD service
- Delete
-   The user can delete an item through the details page.
-   After searching, the user will access the details page, by typing an item id(e.g. 0002) below and clicking the delete button will delete the item and redirect to the home page displaying an updated list of all items.


********************************************


# Restful
In this project, there are 7 RESTful services.


- login
  - Request Type: GET
  - URL path: /api/item/login/:username/:password
  - Test: curl -X GET https://project-test-381.onrender.com/api/item/login/user1/password1
  - Desc: to login with username and password


- logout
  Request Type: GET
  URL path: /api/item/logout
  Test: curl -X GET https://project-test-381.onrender.com/api/item/logout
  Desc: to logout


- list
  Request Type: GET
  URL path: /api/item/list
  Test: curl -X GET https://project-test-381.onrender.com/api/item/list
  Desc: to list all items in the database


- find
  Request Type: GET
  URL path: /api/item/find/:itemID
  Test: curl -X GET https://project-test-381.onrender.com/api/item/find/9999
  Desc: to find a single item with its id


- insert
  Request Type: POST
  URL path: /api/item/insert
  Test: curl -X POST -H "Content-Type: application/json" --data '{"name": "insert", "id":"9999", "description":"test", "category":"test", "quantity":"1"}' https://project-test-381.onrender.com/api/item/insert
  Desc: to insert new item to the database


- update
  Request Type: PUT
  URL path: /api/item/update/:itemID/:quantity
  Test: curl -X PUT https://project-test-381.onrender.com/api/item/update/9999/99
  Desc: to update the quantity of an item


- delete
  Request Type: DELETE
  URL path: /api/item/delete/:itemID
  Test: curl -X GET https://project-test-381.onrender.com/api/item/logout
  Desc: to delete an item from the database
  





