"use strict";
import { reqInfo } from "../../helpers/winston_logger";
// import { favoriteModel, roomModel } from '../../database'
import { apiResponse } from "../../common";
import { Request, Response } from "express";
import { responseMessage } from "../../helpers/response";
import { userModel } from "../../database/models";

const ObjectId = require("mongoose").Types.ObjectId;

export const get_user = async (req: Request, res: Response) => {
          let  { limit, page } = req.body,skip = 0,
        response: any = {},
        match: any = {}
        
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

  reqInfo(req);
  try {
    let user_data = await userModel.aggregate([{ $match: { isActive: true } },{
                $facet: {
                    post: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                               password : 0 
                            }
                        }
                    ],
                    user_count: [{ $count: "count" }]
                }
            }]);

    response.user_data = user_data
        response.state = {
            page,
            limit,
            page_limit: Math.ceil(user_data[0]?.user_count[0]?.count / limit),
            user_count: user_data[0]?.user_count[0]?.count
        }
    return res
      .status(200)
      .json(new apiResponse(200, "Get user Sucessfull", response, {}));
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiResponse(500, responseMessage?.internalServerError, {}, error)
      );
  }
};
