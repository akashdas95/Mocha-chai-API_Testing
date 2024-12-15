import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import { expect } from 'chai';
import storeToken from './setEnvVar.js'
import { faker } from '@faker-js/faker';
import generateRandomId from './utils.js';
import jsonData from './userData.json' assert { type: 'json' };
import fs from 'fs';
import { before } from 'mocha';


describe("Dmoney Api Test", ()=>{
    before(()=>{
        console.log("Test starting\n");
    });

    afterEach((done)=>{
        console.log("Starting next test\n");
        setTimeout(()=>{
            done();
        },1000);   
    });

    after(()=>{
        console.log("All Test complete");
    });

    describe("User login", ()=>{
        it("User login with wrong crad", async()=>{
            try{
                const response = await axios.post(`${process.env.base_url}/user/login`,{
                    "email": "user@roadtocareer.net",
                    "password": "1234",
        
                },{
                    headers:{
                        'Content-Type': 'application/json'
                    }  
                });
                expect(response.data.message).to.contains("User not found");
                expect(response.status).to.equal(404);
            }catch(err){
                if(err.response){
                    expect(err.response.data.message).to.contains("User not found");
                    expect(err.response.status).to.equal(404); 
                }else{
                    console.error('unexpected error', err);
                }
            }
        })

        it("User login with valid crad", async()=>{
            const response = await axios.post(`${process.env.base_url}/user/login`,{
                "email": "agent@roadtocareer.net",
                "password": "1234",
    
            },{
                headers:{
                    'Content-Type': 'application/json'
                }  
            });
    
            expect(response.data.message).to.contains("Login successful");
            storeToken('token',response.data.token);
        })

        it("Admin login with wrong password", async()=>{
            try{
                const response = await axios.post(`${process.env.base_url}/user/login`,{
                    "email": "admin@roadtocareer.net",
                    "password": "12345",
        
                },{
                    headers:{
                        'Content-Type': 'application/json'
                    }
                });
                expect(response.data.message).to.contains("Password incorrect");
                expect(response.status).to.equal(401);
            }catch(err){
                if (err.response) {
                    expect(err.response.status).to.equal(401);
                    expect(err.response.data.message).to.contain("Password incorrect");
                } else {
                    console.error('Unexpected error:', err);
                }
            }
        })

        it("Admin login with wrong Email", async()=>{
            try{
                const response = await axios.post(`${process.env.base_url}/user/login`,{
                    "email": "adminn@roadtocareer.net",
                    "password": "1234"
                },{
                    headers:{
                        'Content-Type': 'application/json'
                    }
                });
                expect(response.data.message).to.contains("User not found");
                expect(response.status).to.equal(404);
            }catch(err){
                if(err.response){
                    expect(err.response.status).to.equal(404);
                    expect(err.response.data.message).to.contains("User not found");
                }
                else{
                    console.error('Unexpected error:', err);
                }
            } 
        })

        it("Admin login with valid crad", async()=>{
            const response = await axios.post(`${process.env.base_url}/user/login`,{
                "email": "admin@roadtocareer.net",
                "password": "1234",
    
            },{
                headers:{
                    'Content-Type': 'application/json'
                }
                
            });
            expect(response.data.message).to.contains("Login successful");
            expect(response.status).to.equal(200);
            storeToken('token',response.data.token);
        })

    })

    describe("User List", ()=>{
        it("user list", async ()=> {
            const response = await axios.get(`${process.env.base_url}/user/list?limit=2`, {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${process.env.token}`
                }
            });
            console.log(response.data.users);
            expect(response.data.message).to.equal("User list");
            expect(response.status).to.equal(200);
        });
    })

    describe("User create", ()=>{
        it("create user", async ()=> {
            const response = await axios.post(`${process.env.base_url}/user/create`, {
                "name": `Axios user ${faker.person.firstName()}`,
                "email": `${faker.internet.email()}`,
                "password": "1234",
                "phone_number": `015025${generateRandomId(10000, 99999)}`,
                "nid": "123456789",
                "role": "merchant"
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `bearer ${process.env.token}`,
                        "X-Auth-Secret-Key":`${process.env.secretKey}`
                    }
                });
            expect(response.data.message).to.contains("User created");
            expect(response.status).to.equal(201);
            storeToken('id',response.data.user.id);
            jsonData.push(response.data.user);
            fs.writeFileSync('./userData.json', JSON.stringify(jsonData, null, 2)); 
        });
    })

    describe("User Search", ()=>{

        it("search user with wrong ID", async ()=> {
            try{
                const response = await axios.get(`${process.env.base_url}/user/search/id/001`, {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `bearer ${process.env.token}`
                    }
                });
                expect(response.data.message).to.equal("User not found");
                expect(response.status).to.equal(404);
            }catch(err){
                if(err.response){
                    expect(err.response.data.message).to.equal("User not found");
                    expect(err.response.status).to.equal(404); 
                }else{
                    console.error('unexpected error', err);
                }
            }
        });

        it("search user with valid ID", async ()=> {
            const response = await axios.get(`${process.env.base_url}/user/search/id/${process.env.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `bearer ${process.env.token}`
                }
            });
            expect(response.data.message).to.equal("User found");
            expect(response.status).to.equal(200);
        });
    })
    
    describe("Delete user", ()=>{
        
        it("delete user with wrong ID", async ()=> {
            try{
                const response = await axios.delete(`${process.env.base_url}/user/delete/002`, {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `bearer ${process.env.token}`,
                        "X-Auth-Secret-Key":`${process.env.secretKey}`
                    }
                });
                expect(response.data.message).to.equal("User not found");
                expect(response.status).to.equal(404);
            }
            catch(err){
                if(err.response){
                    expect(err.response.data.message).to.equal("User not found");
                    expect(err.response.status).to.equal(404);
                }
                else{
                    console.error('unexpected error', err);
                }
            }
        });

        it("delete user with valid ID", async ()=> {
            const response = await axios.delete(`${process.env.base_url}/user/delete/${process.env.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `bearer ${process.env.token}`,
                    "X-Auth-Secret-Key":`${process.env.secretKey}`
                }
            });
            expect(response.data.message).to.equal("User deleted successfully");
            expect(response.status).to.equal(200);
            storeToken('id',null);
        });
    })
})