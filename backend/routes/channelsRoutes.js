import express from "express";
import {
  getAllChannels,getArticlesByChannel
} from "../controllers/channelController.js";


const router = express.Router();
//get all channels
router.get("/",getAllChannels);
//get articles by channel id
router.get("/channel/:channelName", getArticlesByChannel);

export default router;
