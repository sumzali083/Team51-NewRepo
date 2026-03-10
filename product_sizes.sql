-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 03, 2026 at 08:35 PM
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
-- Table structure for table `product_sizes`
--

CREATE TABLE `product_sizes` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_sizes`
--

INSERT INTO `product_sizes` (`id`, `product_id`, `size`) VALUES
(21, 1, 'S'),
(22, 1, 'M'),
(23, 1, 'L'),
(24, 1, 'XL'),
(25, 3, 'S'),
(26, 3, 'M'),
(27, 3, 'L'),
(28, 3, 'XL'),
(29, 4, 'S'),
(30, 4, 'M'),
(31, 4, 'L'),
(32, 4, 'XL'),
(33, 4, 'XXL'),
(34, 5, 'S'),
(35, 5, 'M'),
(36, 5, 'L'),
(37, 5, 'XL'),
(38, 6, 'S'),
(39, 6, 'M'),
(40, 6, 'L'),
(41, 6, 'XL'),
(42, 7, 'M'),
(43, 7, 'L'),
(44, 8, 'XS'),
(45, 8, 'S'),
(46, 8, 'M'),
(47, 8, 'L'),
(48, 9, 'XS'),
(49, 9, 'S'),
(50, 9, 'M'),
(51, 9, 'L'),
(52, 9, 'XL'),
(53, 10, 'XS'),
(54, 10, 'S'),
(55, 10, 'M'),
(56, 10, 'L'),
(57, 10, 'XL'),
(58, 11, 'XS'),
(59, 11, 'S'),
(60, 11, 'M'),
(61, 11, 'L'),
(62, 12, 'XS'),
(63, 12, 'S'),
(64, 12, 'M'),
(65, 12, 'L'),
(66, 12, 'XL'),
(67, 13, 'XS'),
(68, 13, 'S'),
(69, 13, 'M'),
(70, 13, 'L'),
(71, 13, 'XL'),
(72, 14, '5-6'),
(73, 14, '7-8'),
(74, 14, '9-10'),
(75, 14, '11-12'),
(76, 15, '5-6'),
(77, 15, '7-8'),
(78, 15, '9-10'),
(79, 15, '11-12'),
(80, 16, '5-6'),
(81, 16, '7-8'),
(82, 16, '9-10'),
(83, 16, '11-12'),
(84, 17, '5-6'),
(85, 17, '7-8'),
(86, 17, '9-10'),
(87, 17, '11-12'),
(88, 18, '5-6'),
(89, 18, '7-8'),
(90, 18, '9-10'),
(91, 18, '11-12'),
(92, 19, '5-8'),
(93, 19, '9-12'),
(94, 20, 'S'),
(95, 20, 'M'),
(96, 20, 'L'),
(97, 20, 'XL'),
(98, 21, 'XS'),
(99, 21, 'S'),
(100, 21, 'M'),
(101, 21, 'L'),
(102, 21, 'XL'),
(103, 22, 'One Size'),
(104, 23, 'XS'),
(105, 23, 'S'),
(106, 23, 'M'),
(107, 23, 'L'),
(108, 23, 'XL'),
(109, 24, 'S'),
(110, 24, 'M'),
(111, 24, 'L'),
(112, 24, 'XL'),
(113, 24, 'XXL'),
(114, 25, 'S'),
(115, 25, 'M'),
(116, 25, 'L'),
(117, 25, 'XL'),
(118, 26, 'XS'),
(119, 26, 'S'),
(120, 26, 'M'),
(121, 26, 'L'),
(122, 27, '5-6'),
(123, 27, '7-8'),
(124, 27, '9-10'),
(125, 27, '11-12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sizes_product` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `product_sizes`
--
ALTER TABLE `product_sizes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=126;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product_sizes`
--
ALTER TABLE `product_sizes`
  ADD CONSTRAINT `fk_sizes_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
