-- MySQL dump 10.13  Distrib 5.5.38, for Linux (x86_64)
--
-- Host: localhost    Database: jz_recipes
-- ------------------------------------------------------
-- Server version	5.5.38

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cookbook_recipes`
--

DROP TABLE IF EXISTS `cookbook_recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cookbook_recipes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cid` tinyint(3) unsigned NOT NULL,
  `page_num` smallint(5) unsigned DEFAULT NULL,
  `has_tried` tinyint(1) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=177 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cookbooks`
--

DROP TABLE IF EXISTS `cookbooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cookbooks` (
  `cid` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipe_types`
--

DROP TABLE IF EXISTS `recipe_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recipe_types` (
  `tid` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recipes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tid` tinyint(3) unsigned NOT NULL,
  `has_tried` tinyint(1) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `ingredients` text,
  `preparation` text,
  `notes` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=841 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cookbooks`
--

LOCK TABLES `cookbooks` WRITE;
/*!40000 ALTER TABLE `cookbooks` DISABLE KEYS */;
INSERT INTO `cookbooks` VALUES (1,'Better Homes and Gardens New Cookbook'),(2,'Best Chicken Cookbook'),(3,'The Working Stiff Cookbook'),(4,'Cook for the Cure Cookbook'),(5,'Jello/Cool Whip Summer Desserts Cookbook'),(6,'Cooking Light Cookbook'),(9,'Cooking with Mickey and the Disney Chefs'),(10,'Cooking Light: The Essential Dinner Tonight Cookbook'),(11,'The Best of Fine Cooking Breakfast 2011'),(12,'Jerusalem: A Cookbook'),(13,'Indian Home Cooking');
/*!40000 ALTER TABLE `cookbooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `recipe_types`
--

LOCK TABLES `recipe_types` WRITE;
/*!40000 ALTER TABLE `recipe_types` DISABLE KEYS */;
INSERT INTO `recipe_types` VALUES (1,'Main Dish'),(2,'Breakfast'),(3,'Dessert'),(4,'Drink'),(5,'Appetizers'),(6,'Side Dish');
/*!40000 ALTER TABLE `recipe_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-26 23:30:10
