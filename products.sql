-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 03, 2026 at 08:34 PM
-- Server version: 8.0.45-0ubuntu0.22.04.1
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cs2team51_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `sku` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock` int NOT NULL DEFAULT '100',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `sku`, `category_id`, `name`, `description`, `price`, `created_at`, `stock`, `image_url`) VALUES
(1, 'm-001', 11, 'AeroFlex Running Tee', 'Featherlight training tee with breathable mesh zones.', '29.99', '2026-02-03 19:10:17', 100, '/assets/men/aeroflex-tee-1.jpg'),
(3, 'm-002', 11, 'Core Training Shorts', 'Quick-dry 7\" shorts with zip pocket.', '24.50', '2026-02-03 19:27:54', 100, '/assets/men/shorts-core-1.jpg'),
(4, 'm-003', 11, 'Therma+ Hoodie', 'Brushed fleece for cool days, athletic cut.', '49.00', '2026-02-03 19:27:54', 100, '/assets/men/hoodie-therma-1.jpg'),
(5, 'm-004', 11, 'Studio Joggers', 'Tapered fit with rib cuffs and drawcord.', '39.00', '2026-02-03 19:27:54', 100, '/assets/men/joggers-studio-1.jpg'),
(6, 'm-005', 11, 'All-Weather Jacket', 'Light shell with storm flap and vents.', '89.00', '2026-02-03 19:27:54', 100, '/assets/men/jacket-allweather-1.jpg'),
(7, 'm-006', 11, 'Everyday Crew Socks (3-pack)', 'Cushioned footbed and arch support.', '12.00', '2026-02-03 19:27:54', 100, '/assets/men/socks-everyday-1.jpg'),
(8, 'w-001', 12, 'AirLite Crop Tee', 'Ultra-soft crop with breathable panels.', '27.99', '2026-02-03 19:27:54', 100, '/assets/women/croptee-airlite-1.jpg'),
(9, 'w-002', 12, 'Sculpt Leggings 7/8', 'High-rise, squat-proof, phone pocket.', '42.00', '2026-02-03 19:27:54', 100, '/assets/women/leggings-sculpt-1.jpg'),
(10, 'w-003', 12, 'Studio Wrap Hoodie', 'Relaxed wrap front, brushed interior.', '55.00', '2026-02-03 19:27:54', 100, '/assets/women/hoodie-studiowrap-1.jpg'),
(11, 'w-004', 12, 'Trail Windbreaker', 'PFC-free finish, packable hood.', '79.00', '2026-02-03 19:27:54', 100, '/assets/women/jacket-trailwind-1.jpg'),
(12, 'w-005', 12, 'Heritage Denim Jacket', 'Classic denim jacket with structured seams and a modern tailored fit.', '59.00', '2026-02-03 19:27:54', 100, '/assets/women/jacket-denim-1.jpg'),
(13, 'w-006', 12, 'Cloud Fleece Joggers', 'Super-soft fleece with tapered leg.', '44.00', '2026-02-03 19:27:54', 100, '/assets/women/joggers-cloudfleece-1.jpg'),
(14, 'k-001', 13, 'Galaxy Graphic Tee', 'Soft cotton tee with glow-in-the-dark galaxy print.', '14.99', '2026-02-03 19:27:54', 100, '/assets/kids/tee-galaxy-1.jpg'),
(15, 'k-002', 13, 'Playground Joggers', 'Durable joggers with knee panels for extra play-time protection.', '19.50', '2026-02-03 19:27:54', 100, '/assets/kids/joggers-playground-1.jpg'),
(16, 'k-003', 13, 'Bright Day Hoodie', 'Cozy overhead hoodie with kangaroo pocket.', '24.99', '2026-02-03 19:27:54', 100, '/assets/kids/hoodie-brightday-1.jpg'),
(17, 'k-004', 13, 'Active Leggings', 'Stretch leggings for PE, dance, or everyday wear.', '17.00', '2026-02-03 19:27:54', 100, '/assets/kids/leggings-active-1.jpg'),
(18, 'k-005', 13, 'All-Weather Shell', 'Lightweight hooded shell for school and weekend adventures.', '34.99', '2026-02-03 19:27:54', 100, '/assets/kids/jacket-shell-1.jpg'),
(19, 'k-006', 13, 'Everyday Trainer Socks (5-pack)', 'Cushioned ankle socks with soft ribbed cuffs.', '10.00', '2026-02-03 19:27:54', 100, '/assets/kids/socks-trainer-1.jpg'),
(20, 'na-001', 14, 'Premium Tech Jacket', 'State-of-the-art moisture-wicking performance jacket.', '99.99', '2026-02-03 19:27:54', 100, '/assets/men/jacket-premium-1.jpg'),
(21, 'na-002', 14, 'Ultra Comfort Sports Bra', 'Maximum support with minimal bounce technology.', '54.99', '2026-02-03 19:27:54', 100, '/assets/women/sportsbra-ultra-1.jpg'),
(22, 'na-003', 14, 'Kids\' Adventure Backpack', 'Ergonomic design with reflective details for safety.', '29.99', '2026-02-03 19:27:54', 100, '/assets/kids/backpack-adventure-1.jpg'),
(23, 'na-004', 14, 'Smart Fitness Leggings', 'Integrated pocket for phone and keys.', '64.99', '2026-02-03 19:27:54', 100, '/assets/women/leggings-smart-1.jpg'),
(24, 'sale-001', 15, 'Classic Cotton Tee - SALE', 'Timeless cotton tee. Was $24.99, now $12.99!', '12.99', '2026-02-03 19:27:54', 100, '/assets/men/tee-classic-1.jpg'),
(25, 'sale-002', 15, 'Summer Shorts Pack - SALE', 'Lightweight shorts. Was $44.99, now $19.99!', '19.99', '2026-02-03 19:27:54', 100, '/assets/men/shorts-summer-1.jpg'),
(26, 'sale-003', 15, 'Women\'s Training Tank - SALE', 'Perfect for gym or yoga. Was $34.99, now $15.99!', '15.99', '2026-02-03 19:27:54', 100, '/assets/women/tank-training-1.jpg'),
(27, 'sale-004', 15, 'Kids\' Colorful Hoodie - SALE', 'Vibrant colors. Was $39.99, now $17.99!', '17.99', '2026-02-03 19:27:54', 100, '/assets/kids/hoodie-colorful-1.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `fk_products_category` (`category_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
