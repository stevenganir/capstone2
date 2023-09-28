## E-COMMERCE API DOCUMENTATION

***TEST ACCOUNTS:***
- Regular User:
     - email: supercustomer@mail.com
     - pwd: superpassword
- Admin User:
    - email: superadmin@mail.com
    - pwd: superpassword
    

***USER ROUTES:***
- User registration (POST)
	- http://localhost:4000/user/register
    - request body: 
        - email (string)
        - firstName (string)
        - lastName (string)
        - password (string)
        - address {
        	- region (string)
        	- province (string)
       		- city (string)
        	- barangay (string)
        	- streetName (string)
        	- buildingHouseNumber (string) 
        	}

- User authentication (AUTH) (POST)
	- http://localhost:4000/user/authentication
    - request body: 
        - email (string)
        - password (string)

- User details (AUTH) (GET)
	- http://localhost:4000/user/user-details
    - request body: none

- Update user details (AUTH) (PUT)
	- http://localhost:4000/user/update-user-details
	- request body:
		- at least one of the following:
		- email (string)
        - password (string)
        - address {
        	- region (string)
        	- province (string)
       		- city (string)
        	- barangay (string)
        	- streetName (string)
        	- buildingHouseNumber (string) 
        	}
    

- Get all users (ADMIN ONLY) (GET)
	- http://localhost:4000/user/
    - request body: none

- Make a user an admin (ADMIN ONLY) (PUT)
	- http://localhost:4000/user/make-admin
    - request body: 
        - userId (ObjectId)

- Delete a user (ADMIN ONLY) (DELETE)
	- http://localhost:4000/user/delete
	- request body:
		- userId (ObjectId)

***PRODUCT ROUTES:***
- Create Product (ADMIN ONLY) (POST)
	- http://localhost:4000/product/create
    - request body: 
        - name (string)
        - description (string)
        - price (number)
        - stockQuantity (number) (OPTIONAL) 

- Get all products (GET)
	- http://localhost:4000/product/
    - request body: none

- Get all active products (GET)
	- http://localhost:4000/product/active-products
    - request body: none

- Get a specific active product by name (POST)
	- http://localhost:4000/product/get-product/name
    - request body:
    	- name (string)

- Get a specific active product by product ID (GET)
	- http://localhost:4000/product/get-product/:productId
	- request body: none

- Get and filter active products (POST)
	- http://localhost:4000/product/get-products/filter
	- request body: 
		- at least one of the following:
		- name (string)
		- description (string)
		- minPrice (number)
		- maxPrice (number)

- Update product information (ADMIN ONLY) (PUT)
	- http://localhost:4000/product/update-product/:productId
	- request body: 
		- at least one of the following:
		- name (string)
		- description (string)
		- price (number)
		- isActive (boolean)
		- stockQuantity (number)

- Archive a product (ADMIN ONLY) (PUT)
	- http://localhost:4000/product/archive-product/:productId
	- request body: none

- Activate a product (ADMIN ONLY) (PUT)
	- http://localhost:4000/product/activate-product/:productId
	- request body: none

***ORDER ROUTES:***
- Create an order (NON-ADMIN ONLY) (POST)
	- http://localhost:4000/order/create-order
    - request body w/o voucher: 
	    - products:[
		    {
		       	- productName (string)
		        - quantity (number)
		    }
	    ],
	    - modeOfPayment (string)

   	- request body w/ voucher:
   		- products:[
		    {
		       	- productName (string)
		        - quantity (number)
		    }
	    ],
	    - modeOfPayment (string)
   		- voucherCode (string)

- Retrieve all user orders (NON-ADMIN ONLY) (GET)
	- http://localhost:4000/order/user-orders
    - request body: none

- Retrieve all orders (ADMIN ONLY) (GET)
	- http://localhost:4000/order/
	- request body: none

- Change order status to processing (ADMIN ONLY) (PUT)
	- http://localhost:4000/order/update-status/processing
	- requestbody:
		- orderIds: [
			orderId (ObjectId)
		]

- Change order status to shipped (ADMIN ONLY) (PUT)
	- http://localhost:4000/order/update-status/shipped
	- requestbody:
		- orderIds: [
			orderId (ObjectId)
		]

- Change order status to outForDelivery (ADMIN ONLY) (PUT)
	- http://localhost:4000/order/update-status/outForDelivery
	- requestbody:
		- orderIds: [
			orderId (ObjectId)
		]

- Change order status to delivered (ADMIN ONLY) (PUT)
	- http://localhost:4000/order/update-status/delivered
	- requestbody:
		- orderIds: [
			orderId (ObjectId)
		]

- Change order status to cancelled (ADMIN ONLY) (PUT)
	- http://localhost:4000/order/update-status/cancelled
	- requestbody:
		- orderIds: [
			orderId (ObjectId)
		]

- Change order status to completed (ADMIN ONLY) (PUT)
	- http://localhost:4000/order/update-status/completed
	- requestbody:
		- orderIds: [
			orderId (ObjectId)
		]

***CART ROUTES:***
- Add to cart (NON-ADMIN ONLY) (POST)
	- http://localhost:4000/cart/addToCart
    - request body: 
        - productName (string)
        - quantity (number)

- Get user cart (NON-ADMIN ONLY) (GET)
	- http://localhost:4000/cart/user-cart
	- request body: none

- Update cart item quantity (NON-ADMIN ONLY) (PUT)
	- http://localhost:4000/cart/updateQuantity
    - request body: 
        - productName (string)
        - quantity (number)

- Delete cart item (NON-ADMIN ONLY) (DELETE)
	- http://localhost:4000/cart/deleteCartItem
	- request body:
		- productName (string)

- Cart checkout (NON-ADMIN ONLY) (POST)
	- http://localhost:4000/cart/checkout
	- request body w/o voucher: 
		- modeOfPayment (string)
	- request body w/ voucher :
		- modeOfPayment (string)
		- voucherCode (string)

***VOUCHER ROUTES:***
- Create voucher (ADMIN ONLY) (POST)
	- http://localhost:4000/voucher/create-voucher
    - request body: 
        - name (string)
        - code (string)
        - type (string)
        - value (number)

- Get all vouchers (ADMIN ONLY) (GET)
	- http://localhost:4000/voucher/
	- request body: none

- Get all active vouchers (ADMIN ONLY) (GET)
	- http://localhost:4000/voucher/active-vouchers
	- request body: none

- Arhive voucher (ADMIN ONLY) (PUT)
	- http://localhost:4000/voucher/archive-voucher/:voucherId
	- request body: none

- Arhive voucher (ADMIN ONLY) (PUT)
	- http://localhost:4000/voucher/activate-voucher/:voucherId
	- request body: none