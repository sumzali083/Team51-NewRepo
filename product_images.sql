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
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `url`, `sort_order`) VALUES
(11, 1, '/assets/men/aeroflex-tee-1.jpg', 0),
(12, 1, '/assets/men/aeroflex-tee-2.jpg', 1),
(13, 3, '/assets/men/shorts-core-1.jpg', 0),
(14, 3, '/assets/men/shorts-core-2.jpg', 1),
(15, 4, '/assets/men/hoodie-therma-1.jpg', 0),
(16, 4, '/assets/men/hoodie-therma-2.jpg', 1),
(17, 5, '/assets/men/joggers-studio-1.jpg', 0),
(18, 5, '/assets/men/joggers-studio-2.jpg', 1),
(19, 6, '/assets/men/jacket-allweather-1.jpg', 0),
(20, 6, '/assets/men/jacket-allweather-2.jpg', 1),
(21, 7, '/assets/men/socks-everyday-1.jpg', 0),
(22, 7, '/assets/men/socks-everyday-2.jpg', 1),
(23, 8, '/assets/women/croptee-airlite-1.jpg', 0),
(24, 8, '/assets/women/croptee-airlite-2.jpg', 1),
(25, 8, '/assets/women/croptee-airlite-3.jpg', 2),
(26, 9, '/assets/women/leggings-sculpt-1.jpg', 0),
(27, 9, '/assets/women/leggings-sculpt-2.jpg', 1),
(28, 10, '/assets/women/hoodie-studiowrap-1.jpg', 0),
(29, 10, '/assets/women/hoodie-studiowrap-2.jpg', 1),
(30, 11, '/assets/women/jacket-trailwind-1.jpg', 0),
(31, 11, '/assets/women/jacket-trailwind-2.jpg', 1),
(32, 12, '/assets/women/jacket-denim-1.jpg', 0),
(33, 12, '/assets/women/jacket-denim-2.jpg', 1),
(34, 13, '/assets/women/joggers-cloudfleece-1.jpg', 0),
(35, 13, '/assets/women/joggers-cloudfleece-2.jpg', 1),
(36, 14, '/assets/kids/tee-galaxy-1.jpg', 0),
(37, 14, '/assets/kids/tee-galaxy-2.jpg', 1),
(38, 15, '/assets/kids/joggers-playground-1.jpg', 0),
(39, 15, '/assets/kids/joggers-playground-2.jpg', 1),
(40, 16, '/assets/kids/hoodie-brightday-1.jpg', 0),
(41, 16, '/assets/kids/hoodie-brightday-2.jpg', 1),
(42, 17, '/assets/kids/leggings-active-1.jpg', 0),
(43, 17, '/assets/kids/leggings-active-2.jpg', 1),
(44, 18, '/assets/kids/jacket-shell-1.jpg', 0),
(45, 18, '/assets/kids/jacket-shell-2.jpg', 1),
(46, 19, '/assets/kids/socks-trainer-1.jpg', 0),
(47, 19, '/assets/kids/socks-trainer-2.jpg', 1),
(48, 20, '/assets/men/jacket-premium-1.jpg', 0),
(49, 20, '/assets/men/jacket-premium-2.jpg', 1),
(50, 21, '/assets/women/sportsbra-ultra-1.jpg', 0),
(51, 21, '/assets/women/sportsbra-ultra-2.jpg', 1),
(52, 22, '/assets/kids/backpack-adventure-1.jpg', 0),
(53, 22, '/assets/kids/backpack-adventure-2.jpg', 1),
(54, 23, '/assets/women/leggings-smart-1.jpg', 0),
(55, 23, '/assets/women/leggings-smart-2.jpg', 1),
(56, 24, '/assets/men/tee-classic-1.jpg', 0),
(57, 24, '/assets/men/tee-classic-2.jpg', 1),
(58, 25, '/assets/men/shorts-summer-1.jpg', 0),
(59, 25, '/assets/men/shorts-summer-2.jpg', 1),
(60, 26, '/assets/women/tank-training-1.jpg', 0),
(61, 26, '/assets/women/tank-training-2.jpg', 1),
(62, 27, '/assets/kids/hoodie-colorful-1.jpg', 0),
(63, 27, '/assets/kids/hoodie-colorful-2.jpg', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_images_product` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
