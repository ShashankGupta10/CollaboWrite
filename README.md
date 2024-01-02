# CollaboWrite 🤝

## Project Description
CollaboWrite is a dynamic collaborative text editing application built on the React, Node.js, Express, Socket.io, and MongoDB stack. It enables real-time collaboration among users, allowing them to edit and share text documents seamlessly. Whether you're working on a project with team members or collaborating on content creation, CollaboWrite provides a smooth and efficient collaborative writing experience.

<!-- Overview -->
## Overview
CollaboWrite transforms the way teams collaborate on text-based content by offering a real-time collaborative editing platform. Imagine working on documents with team members from different locations, all contributing simultaneously. CollaboWrite makes this vision a reality, providing a feature-rich and user-friendly environment for collaborative text editing.

### 1. Real Time Collaboration
CollaboWrite leverages the power of Socket.io to enable real-time collaboration. Changes made by one user are instantly reflected across all connected clients, ensuring a synchronized and seamless editing experience.

### 2. Secure and Scalable
Built on a robust stack, CollaboWrite ensures the security of your data and provides scalability to accommodate growing user bases. Your collaborative editing sessions are secure, reliable, and can scale with your team's needs.

### 3. User Friendly Interface
CollaboWrite offers an intuitive and user-friendly interface, making it easy for users to navigate and collaborate effortlessly. Whether you're a seasoned developer or a non-technical team member, the platform caters to all.

CollaboWrite is not just a collaborative text editor; it's a tool that enhances teamwork, boosts productivity, and simplifies the collaborative writing process. Experience the power of real-time collaboration with CollaboWrite!

<!-- Use Cases -->
## Use Cases
Explore the versatility of Code Wizard and discover how it can elevate various aspects of your coding workflow.

### 1. Real Time Editing
Edit documents simultaneously with team members, and see changes in real time as they occur.

### 1. Team Brainstorming
CollaboWrite serves as an excellent platform for team brainstorming sessions. Team members can contribute ideas, suggestions, and feedback in real time, fostering creativity and innovation.

### 3. Meeting Minutes Collaboration
During virtual or in-person meetings, CollaboWrite simplifies the process of collaboratively documenting meeting minutes. Team members can collectively capture key points, action items, and decisions.

### 4. Remote Pair Programming
Facilitate remote pair programming sessions effortlessly with CollaboWrite. Developers can code together in real time, share insights, and troubleshoot issues collaboratively.

## Tech Stack
- **React.js**: Frontend library for building user interfaces.
- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web application framework for Node.js.
- **Socket.io**: Real-time bidirectional event-based communication library.
- **MongoDB Atlas**: NoSQL database for storing collaborative document data on the cloud.


## Deployed Link
[Live](https://collabowrite.vercel.app/)

<!-- Getting Started -->
## Getting Started
Get CollaboWrite up and running on your local machine with these simple steps.

### Prerequisites
Ensure you have the following prerequisites installed on your machine:

- [Node.js](https://nodejs.org/en/download) (version 18 or higher)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/) (installed and running)

### Installation
1. **Clone the Repository**:
    ```bash

    git clone https://github.com/ShashankGupta10/CollaboWrite.git
    cd CollaboWrite

2. **Install Dependencies**:

    ```bash
    cd ./client
    npm install

    cd ./server
    npm install

3. **Add ENVIRONMENT variables**
    - Create a .env file in the server directory of the project.
    - Add the following keys to the .env file
    - MONGO_DB_URI = your_mongodb_atlas_uri
    - PORT = backend_port
    - CLIENT_URL = frontend_url (for CORS)

4. **Run the Application**:

    - Execute the following command:
    ```bash
    cd ./client
    npm run dev

    cd ./server
    node app.js

## Demo

https://github.com/ShashankGupta10/CollaboWrite/assets/117008526/0c78b608-4185-497e-9be6-5980c25678dc

## Author
Made with ❤️ by Shashank Gupta

# Elevate your collaboration with CollaboWrite and redefine your collaborative writing journey!
