import { Request, Response } from "express";
import { getRepository } from "typeorm";

import { User } from "../entity/User";

/**
 * The controller for all things related to users
 * @class
 */
class UserController {
    /**
     * The function that returns all users on a server.
     * Request body should be empty.
     * Should not be exposed.
     * 
     * @param req - the request object
     * @param res - the response object
     * @summary Return all users on a server
     */
    static listAll = async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const users = await userRepository.find({
            select: ["id", "username"]
        });

        //Send the users object
        res.send(users);
    };

    /**
     * The function that returns a user based on an id.
     * Request body must contain an id, which is a number.
     * Should not be exposed.
     * 
     * @param req - the request object
     * @param res - the response object
     * @summary Get a single user based on id
     */
    static getOneById = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id: number = req.body.id || req.body.userId;

        //Get the user from database
        const userRepository = getRepository(User);
        try {
            const user = await userRepository.findOneOrFail(id, {
                select: ["id", "username"]
            });
            res.send(user);
        } catch (error) {
            res.status(404).send("User not found");
        }
    };

    /**
     * The function that creates a new user.
     * Request body must contain the email, the username and the passowrd, all of which strings.
     * 
     * @param req - the request object
     * @param res - the response object
     * @summary Create new user
     */
    static newUser = async (req: Request, res: Response) => {
        const { username, password, email } = req.body;
        
        console.log(req.body);
        
        let user = new User();
        user.username = username;
        user.password = password;
        user.email = email;
        
        user.hashPassword();

        const userRepository = getRepository(User);
        try {
            await userRepository.save(user);
        } catch (e) {
            return res.status(409).send("Username already in use");
        }

        res.status(201).send("User created");
    };

    /**
     * The function that modifies the user data.
     * Request body must contain the email, the username and the passowrd, all of which strings and the user's id, which is a number.
     * 
     * @param req - the request object
     * @param res - the response object
     * @summary Modify user
     */
    static editUser = async (req: Request, res: Response) => {
        const id = req.body.id;

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            //If not found, send a 404 response
            res.status(404).send("User not found");
            return;
        }

        user.username = req.body.username ? req.body.username : user.username;
        user.email = req.body.email ? req.body.email : user.email;

        try {
            await userRepository.save(user);
        } catch (e) {
            return res.status(409).send("Username already in use");
        }

        res.status(204).send();
    };

    /**
     * The function that deletes the user.
     * Request body must contain the user's id, which is a number.
     * 
     * @param req - the request object
     * @param res - the response object
     * @summary Delete user
     */
    static deleteUser = async (req: Request, res: Response) => {
        const id = req.body.id;

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            return res.status(404).send("User not found");
        }
        userRepository.delete(user);

        res.status(204).send();
    };

    static isLoggedIn = async (req: Request, res: Response) => {
        if (!res.locals.jwtPayload) res.status(403).send(false);
        else res.status(200).send(true);
    }
};

export default UserController;
