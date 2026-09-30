CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(24) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  slug VARCHAR(40) NOT NULL UNIQUE,
  description VARCHAR(180) NOT NULL DEFAULT '',
  image VARCHAR(300) NOT NULL DEFAULT ''
);

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(400) NOT NULL,
  base_price DECIMAL(8,2) NOT NULL,
  compare_at DECIMAL(8,2) NULL,
  image VARCHAR(300) NOT NULL DEFAULT '',
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.8,
  preparation_time INT NOT NULL DEFAULT 15,
  calories INT NOT NULL DEFAULT 0,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  is_vegetarian TINYINT(1) NOT NULL DEFAULT 0,
  is_spicy TINYINT(1) NOT NULL DEFAULT 0,
  discount_percent INT NOT NULL DEFAULT 0,
  customizer ENUM('pizza','doner','simple') NOT NULL DEFAULT 'simple',
  allergens VARCHAR(180) NOT NULL DEFAULT '',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  builder TINYINT(1) NOT NULL DEFAULT 0,
  default_size VARCHAR(40) NOT NULL DEFAULT '',
  default_crust VARCHAR(40) NOT NULL DEFAULT '',
  default_cheese VARCHAR(40) NOT NULL DEFAULT '',
  default_type VARCHAR(40) NOT NULL DEFAULT '',
  default_bread VARCHAR(40) NOT NULL DEFAULT '',
  default_sauce VARCHAR(40) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE ingredients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  price DECIMAL(8,2) NOT NULL DEFAULT 0,
  category ENUM('base','pizza','doner','both') NOT NULL,
  image VARCHAR(300) NOT NULL DEFAULT ''
);

CREATE TABLE product_ingredients (
  product_id INT UNSIGNED NOT NULL,
  ingredient_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, ingredient_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  customer_name VARCHAR(80) NOT NULL,
  customer_email VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(24) NOT NULL,
  subtotal DECIMAL(8,2) NOT NULL,
  delivery_fee DECIMAL(8,2) NOT NULL,
  discount DECIMAL(8,2) NOT NULL DEFAULT 0,
  discount_code VARCHAR(20) NOT NULL DEFAULT '',
  tax DECIMAL(8,2) NOT NULL,
  total DECIMAL(8,2) NOT NULL,
  status ENUM('pending','confirmed','preparing','ready','completed','cancelled','received','cooking','out_for_delivery','delivered') NOT NULL DEFAULT 'pending',
  payment_method ENUM('cod','card') NOT NULL DEFAULT 'cod',
  delivery_address VARCHAR(260) NOT NULL,
  delivery_instructions VARCHAR(240) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  product_name VARCHAR(80) NOT NULL,
  image VARCHAR(300) NOT NULL DEFAULT '',
  quantity INT NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  total_price DECIMAL(8,2) NOT NULL,
  options_json TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  product_id INT UNSIGNED NOT NULL,
  author_name VARCHAR(80) NOT NULL,
  rating TINYINT NOT NULL,
  comment VARCHAR(400) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL,
  message VARCHAR(800) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, phone, password_hash, role) VALUES
('STOP&GO Admin', 'admin@stopandgo.com', '5550142026', '$2a$10$FuLLhqItltMyIDcYzd9V6.sL/X8gUXUujF.KD0ruiQFdeuaenZlr6', 'admin'),
('Amina Karim', 'guest@stopandgo.com', '5550141188', '$2a$10$4HZ0CGSZQFcksC8hvQz.F.ZUBdD26orFOJBuqdtDA4mHz1.JuGk9i', 'customer');

INSERT INTO categories (name, slug, description, image) VALUES
('Broodjes', 'broodjes', 'Filled bread, made to order.', 'images/menu/broodje.jpg'),
('Durum / Wrap', 'durum', 'Rolled wraps from the spit.', 'images/menu/durum.jpg'),
('Kapsalon', 'kapsalon', 'Fries, meat, cheese and salad.', 'images/menu/kapsalon.jpg'),
('Snacks', 'snacks', 'Fries and the classic snack counter.', 'images/menu/snacks.jpg'),
('Schotels', 'schotels', 'Plates for a proper stop.', 'images/menu/schotel.jpg'),
('Salades', 'salades', 'Cold, fresh, and ready to go.', 'images/menu/salade.jpg'),
('Pizza', 'pizza', 'Baked pies, built your way.', 'images/menu/pizza-house.jpg');

INSERT INTO ingredients (name, price, category) VALUES
('Tomato Sauce', 0, 'base'),
('Mozzarella', 0, 'base'),
('Oregano', 0, 'base'),
('Fresh Basil', 0, 'base'),
('Lettuce', 0, 'base'),
('Tomato', 0, 'base'),
('Onion', 0, 'base'),
('Pickles', 0, 'base'),
('Chili Chicken', 0, 'base'),
('Cup Pepperoni', 0, 'base'),
('Extra Cheese', 2, 'both'),
('Pepperoni', 3, 'pizza'),
('Chicken', 3, 'pizza'),
('Beef', 3.5, 'pizza'),
('Mushrooms', 1.5, 'pizza'),
('Olives', 1.5, 'pizza'),
('Jalapeños', 1.25, 'both'),
('Onions', 1, 'pizza'),
('Bell Peppers', 1.25, 'pizza'),
('Extra Sauce', 1, 'both'),
('Extra Meat', 3, 'doner');

INSERT INTO products (category_id, name, description, base_price, compare_at, image, rating, preparation_time, calories, is_vegetarian, is_spicy, discount_percent, customizer, allergens, featured, builder, default_size, default_crust, default_cheese, default_type, default_bread, default_sauce) VALUES
(1, 'Shoarma', 'Shaved shoarma in a fresh broodje, with salad and sauce.', 7.00, NULL, 'images/menu/broodje.jpg', 4.8, 12, 640, 0, 0, 0, 'doner', 'Gluten', 1, 0, 'regular', '', '', 'beef', 'pita', 'garlic'),
(1, 'Doner kebab', 'Doner kebab in a broodje, with salad and garlic sauce.', 7.00, NULL, 'images/menu/broodje.jpg', 4.8, 12, 660, 0, 0, 0, 'doner', 'Gluten', 0, 0, 'regular', '', '', 'beef', 'pita', 'garlic'),
(1, 'Kipdoner', 'Chicken doner in a broodje, finished with sauce.', 7.00, NULL, 'images/spicy-chicken.png', 4.8, 12, 620, 0, 0, 0, 'doner', 'Gluten', 1, 0, 'regular', '', '', 'chicken', 'pita', 'garlic'),
(1, 'Kipfilet', 'Grilled chicken fillet in a broodje.', 7.00, NULL, 'images/spicy-chicken.png', 4.7, 12, 600, 0, 0, 0, 'doner', 'Gluten', 0, 0, 'regular', '', '', 'chicken', 'pita', 'garlic'),
(1, 'Falafel', 'Crisp falafel in a broodje, with salad and sauce.', 6.00, NULL, 'images/menu/broodje.jpg', 4.7, 12, 520, 1, 0, 0, 'doner', 'Gluten', 0, 0, 'regular', '', '', 'chicken', 'pita', 'garlic'),
(1, 'Hamburger', 'A grilled hamburger in a soft broodje.', 5.00, NULL, 'images/meat-lover.png', 4.6, 12, 700, 0, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(1, 'Kipschnitzel', 'Crisp chicken schnitzel in a broodje.', 6.00, NULL, 'images/spicy-chicken.png', 4.6, 12, 680, 0, 0, 0, 'simple', 'Gluten, Egg', 0, 0, '', '', '', '', '', ''),
(1, 'Gezond', 'A fresh broodje with salad.', 4.50, NULL, 'images/menu/salade.jpg', 4.5, 8, 280, 1, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(1, 'Ham kaas', 'Ham and cheese in a warm broodje.', 3.50, NULL, 'images/menu/broodje.jpg', 4.5, 8, 420, 0, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(1, 'Ham kaas, ananas', 'Ham, cheese and pineapple in a warm broodje.', 3.50, NULL, 'images/menu/broodje.jpg', 4.5, 8, 440, 0, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(1, 'Kaas', 'Melted cheese in a warm broodje.', 2.50, NULL, 'images/menu/broodje.jpg', 4.4, 8, 380, 1, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(2, 'Durum Shoarma', 'Shoarma rolled in a durum wrap.', 7.00, NULL, 'images/menu/durum.jpg', 4.8, 12, 700, 0, 0, 0, 'doner', 'Gluten', 1, 0, 'regular', '', '', 'beef', 'wrap', 'garlic'),
(2, 'Durum Doner kebab', 'Doner kebab rolled in a durum wrap.', 7.00, NULL, 'images/menu/durum.jpg', 4.8, 12, 720, 0, 0, 0, 'doner', 'Gluten', 0, 0, 'regular', '', '', 'beef', 'wrap', 'garlic'),
(2, 'Durum Kipdoner', 'Chicken doner rolled in a durum wrap.', 7.00, NULL, 'images/menu/durum.jpg', 4.8, 12, 680, 0, 0, 0, 'doner', 'Gluten', 0, 0, 'regular', '', '', 'chicken', 'wrap', 'garlic'),
(2, 'Durum Kipfilet', 'Chicken fillet rolled in a durum wrap.', 7.00, NULL, 'images/spicy-chicken.png', 4.7, 12, 660, 0, 0, 0, 'doner', 'Gluten', 0, 0, 'regular', '', '', 'chicken', 'wrap', 'garlic'),
(2, 'Durum Falafel', 'Falafel rolled in a durum wrap.', 7.00, NULL, 'images/menu/durum.jpg', 4.7, 12, 600, 1, 0, 0, 'doner', 'Gluten', 0, 0, 'regular', '', '', 'chicken', 'wrap', 'garlic'),
(2, 'Durum Mix', 'A mixed meat durum wrap.', 8.00, NULL, 'images/menu/durum.jpg', 4.9, 14, 780, 0, 0, 0, 'doner', 'Gluten', 1, 0, 'regular', '', '', 'mixed', 'wrap', 'house'),
(3, 'Kapsalon Shoarma', 'Fries, shoarma, cheese and fresh salad.', 11.00, NULL, 'images/menu/kapsalon.jpg', 4.9, 15, 980, 0, 0, 0, 'simple', 'Gluten, Dairy', 1, 0, '', '', '', '', '', ''),
(3, 'Kapsalon Doner kebab', 'Fries, doner kebab, cheese and fresh salad.', 11.00, NULL, 'images/menu/kapsalon.jpg', 4.8, 15, 1000, 0, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(3, 'Kapsalon Kipdoner', 'Fries, chicken doner, cheese and fresh salad.', 11.00, NULL, 'images/menu/kapsalon.jpg', 4.8, 15, 960, 0, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(3, 'Kapsalon Kipfilet', 'Fries, chicken fillet, cheese and fresh salad.', 11.00, NULL, 'images/spicy-chicken.png', 4.7, 15, 940, 0, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(3, 'Kapsalon Falafel', 'Fries, falafel, cheese and fresh salad.', 11.00, NULL, 'images/menu/kapsalon.jpg', 4.7, 15, 900, 1, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(3, 'Kapsalon Mix', 'Fries, mixed meat, cheese and fresh salad.', 15.00, NULL, 'images/menu/kapsalon.jpg', 4.9, 16, 1100, 0, 0, 0, 'simple', 'Gluten, Dairy', 1, 0, '', '', '', '', '', ''),
(4, 'Kipnuggets 8 stuks', 'Eight crisp chicken nuggets.', 6.50, NULL, 'images/menu/snacks.jpg', 4.6, 10, 520, 0, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(4, 'Kipnuggets 12 stuks', 'Twelve crisp chicken nuggets.', 8.50, NULL, 'images/menu/snacks.jpg', 4.6, 10, 740, 0, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(4, 'Hotwings 8 stuks', 'Eight hot chicken wings.', 6.50, NULL, 'images/spicy-chicken.png', 4.7, 12, 560, 0, 1, 0, 'simple', '', 0, 0, '', '', '', '', '', ''),
(4, 'Hotwings 12 stuks', 'Twelve hot chicken wings.', 8.50, NULL, 'images/spicy-chicken.png', 4.7, 12, 780, 0, 1, 0, 'simple', '', 0, 0, '', '', '', '', '', ''),
(4, 'Hotwings 16 stuks', 'Sixteen hot chicken wings.', 10.50, NULL, 'images/spicy-chicken.png', 4.8, 14, 980, 0, 1, 0, 'simple', '', 1, 0, '', '', '', '', '', ''),
(4, 'Kipcorn', 'A crisp kipcorn snack.', 3.00, NULL, 'images/menu/snacks.jpg', 4.5, 8, 280, 0, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(4, 'Frikandel', 'A classic Dutch frikandel.', 3.00, NULL, 'images/menu/snacks.jpg', 4.6, 8, 320, 0, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(4, 'Kroket (rund)', 'A beef kroket, crisp outside.', 3.00, NULL, 'images/menu/snacks.jpg', 4.6, 8, 300, 0, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(4, 'Kaassouffle', 'A fried cheese souffle.', 3.00, NULL, 'images/menu/snacks.jpg', 4.7, 8, 340, 1, 0, 0, 'simple', 'Gluten, Dairy', 0, 0, '', '', '', '', '', ''),
(4, 'Falafel 5 stuks', 'Five falafel balls.', 4.00, NULL, 'images/menu/snacks.jpg', 4.6, 8, 360, 1, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(4, 'Portie patat', 'A portion of fries.', 4.00, NULL, 'images/menu/kapsalon.jpg', 4.6, 8, 480, 1, 0, 0, 'simple', '', 0, 0, '', '', '', '', '', ''),
(5, 'Schotel Shoarma', 'A shoarma plate with salad and sauce.', 13.00, NULL, 'images/menu/schotel.jpg', 4.8, 16, 900, 0, 0, 0, 'simple', 'Gluten', 1, 0, '', '', '', '', '', ''),
(5, 'Schotel Donerkebab', 'A doner kebab plate with salad and sauce.', 13.00, NULL, 'images/menu/schotel.jpg', 4.8, 16, 920, 0, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(5, 'Schotel Kipdoner', 'A chicken doner plate with salad and sauce.', 13.00, NULL, 'images/menu/schotel.jpg', 4.8, 16, 880, 0, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(5, 'Schotel Kipfilet', 'A chicken fillet plate with salad and sauce.', 13.00, NULL, 'images/spicy-chicken.png', 4.7, 16, 860, 0, 0, 0, 'simple', 'Gluten', 0, 0, '', '', '', '', '', ''),
(5, 'Mixed grill (2 soorten vlees)', 'Mixed grill with two kinds of meat.', 14.50, NULL, 'images/menu/schotel.jpg', 4.9, 18, 980, 0, 0, 0, 'simple', 'Gluten', 1, 0, '', '', '', '', '', ''),
(5, 'Mixed grill (3 soorten vlees)', 'Mixed grill with three kinds of meat.', 17.00, NULL, 'images/meat-lover.png', 4.9, 20, 1100, 0, 0, 0, 'simple', 'Gluten', 1, 0, '', '', '', '', '', ''),
(6, 'Mista Salade', 'A mixed green salad.', 5.50, NULL, 'images/menu/salade.jpg', 4.6, 6, 180, 1, 0, 0, 'simple', '', 0, 0, '', '', '', '', '', ''),
(6, 'Kip Salade', 'Salad with grilled chicken.', 7.00, NULL, 'images/menu/salade.jpg', 4.7, 8, 320, 0, 0, 0, 'simple', '', 0, 0, '', '', '', '', '', ''),
(6, 'Tonijn Salade', 'Salad with tuna.', 7.00, NULL, 'images/menu/salade.jpg', 4.7, 8, 340, 0, 0, 0, 'simple', 'Fish', 0, 0, '', '', '', '', '', ''),
(7, 'Pizza Margherita', 'Tomato, mozzarella and basil.', 8.00, NULL, 'images/menu/pizza-house.jpg', 4.8, 16, 720, 1, 0, 0, 'pizza', 'Gluten, Dairy', 1, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza cipolla', 'Tomato, mozzarella and onion.', 9.00, NULL, 'images/veggie-delight.png', 4.6, 16, 740, 1, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza funghi', 'Tomato, mozzarella and mushrooms.', 9.00, NULL, 'images/veggie-delight.png', 4.7, 16, 750, 1, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza mozzarella', 'Extra mozzarella on tomato sauce.', 9.00, NULL, 'images/menu/pizza-house.jpg', 4.7, 16, 800, 1, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'extra', '', '', ''),
(7, 'Pizza vegetariana', 'A vegetable pizza with mozzarella.', 11.00, NULL, 'images/veggie-delight.png', 4.8, 18, 780, 1, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza quattro formaggio', 'Four cheeses on a baked crust.', 11.00, NULL, 'images/menu/pizza-house.jpg', 4.8, 18, 900, 1, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'extra', '', '', ''),
(7, 'Pizza tonno', 'Tuna and mozzarella.', 11.00, NULL, 'images/pepperoni-pizza.png', 4.6, 18, 820, 0, 0, 0, 'pizza', 'Gluten, Dairy, Fish', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza marinara', 'Seafood-style marinara pizza.', 11.00, NULL, 'images/pepperoni-pizza.png', 4.6, 18, 800, 0, 0, 0, 'pizza', 'Gluten, Dairy, Fish', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza borromea', 'A house pizza, baked to order.', 10.00, NULL, 'images/meat-lover.png', 4.7, 18, 840, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza salami', 'Salami and mozzarella.', 10.00, NULL, 'images/pepperoni-pizza.png', 4.8, 18, 860, 0, 0, 0, 'pizza', 'Gluten, Dairy', 1, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza bolognese', 'Minced meat sauce and mozzarella.', 10.00, NULL, 'images/meat-lover.png', 4.7, 18, 880, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza pepperoni', 'Pepperoni and mozzarella.', 10.50, NULL, 'images/pepperoni-pizza.png', 4.9, 18, 900, 0, 1, 0, 'pizza', 'Gluten, Dairy', 1, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza Hawai', 'Ham, pineapple and mozzarella.', 10.50, NULL, 'images/menu/pizza-house.jpg', 4.6, 18, 860, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza quattro stagioni', 'Four seasons on one pie.', 11.00, NULL, 'images/meat-lover.png', 4.8, 18, 900, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza capanna', 'Ham, mushrooms and mozzarella.', 11.00, NULL, 'images/meat-lover.png', 4.7, 18, 880, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza shoarma', 'Shoarma and mozzarella.', 11.00, NULL, 'images/meat-lover.png', 4.8, 18, 920, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza doner', 'Doner and mozzarella.', 11.00, NULL, 'images/meat-lover.png', 4.8, 18, 920, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza pollo', 'Chicken and mozzarella.', 11.00, NULL, 'images/spicy-chicken.png', 4.8, 18, 900, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza kip doner', 'Chicken doner and mozzarella.', 11.00, NULL, 'images/spicy-chicken.png', 4.8, 18, 910, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza calabrese', 'Spicy salami and mozzarella.', 12.00, NULL, 'images/pepperoni-pizza.png', 4.8, 18, 940, 0, 1, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'regular', '', '', ''),
(7, 'Pizza kapsalon', 'Fries, meat and cheese on a pizza.', 12.00, NULL, 'images/menu/kapsalon.jpg', 4.8, 20, 1100, 0, 0, 0, 'pizza', 'Gluten, Dairy', 0, 0, 'medium', 'classic', 'extra', '', '', ''),
(7, 'Pizza Hintham', 'The house special pizza.', 13.00, NULL, 'images/pepperoni-pizza.png', 4.9, 20, 980, 0, 0, 0, 'pizza', 'Gluten, Dairy', 1, 0, 'medium', 'classic', 'regular', '', '', '');

INSERT INTO reviews (user_id, product_id, author_name, rating, comment) VALUES
(2, 1, 'Amina K.', 5, 'The shoarma broodje is filled to order and the garlic sauce is the one I come back for.'),
(2, 17, 'Jonas P.', 5, 'Durum mix, still warm, with the salad staying crisp.'),
(2, 18, 'Leila M.', 5, 'Kapsalon shoarma, both sauces, and the fries are still crisp.');