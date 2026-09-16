const express = require("express");

const app = express();

const PORT = 8080;

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Infra Deploy AWS</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f4f6f8;
                    margin: 0;
                    padding: 0;
                    color: #222;
                }

                .container {
                    max-width: 900px;
                    margin: 50px auto;
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }

                h1 {
                    margin-bottom: 10px;
                }

                .status {
                    display: inline-block;
                    padding: 8px 16px;
                    background: #d4edda;
                    color: #155724;
                    border-radius: 20px;
                    font-weight: bold;
                    margin: 10px 0 30px;
                }

                .technologies {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-top: 20px;
                }

                .card {
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #ddd;
                }

                .pipeline {
                    margin-top: 35px;
                    padding: 25px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    text-align: center;
                    font-weight: bold;
                }

                .footer {
                    margin-top: 35px;
                    text-align: center;
                    color: #666;
                }

                @media (max-width: 700px) {
                    .technologies {
                        grid-template-columns: 1fr;
                    }

                    .container {
                        margin: 20px;
                        padding: 25px;
                    }
                }
            </style>
        </head>

        <body>
            <div class="container">

                <h1>🚀 Infra Deploy AWS</h1>

                <p>Infrastructure & CI/CD Project</p>

                <div class="status">
                    ● APPLICATION RUNNING
                </div>

                <h2>Technology Stack</h2>

                <div class="technologies">
                    <div class="card">☁️<br><strong>AWS EC2</strong></div>
                    <div class="card">🐳<br><strong>Docker</strong></div>
                    <div class="card">📦<br><strong>Amazon ECR</strong></div>
                    <div class="card">🏗️<br><strong>Terraform</strong></div>
                    <div class="card">⚙️<br><strong>GitHub Actions</strong></div>
                    <div class="card">🔐<br><strong>GitHub OIDC</strong></div>
                </div>

                <h2>CI/CD Pipeline</h2>

                <div class="pipeline">
                    GitHub
                    →
                    GitHub Actions
                    →
                    Terraform
                    →
                    Amazon ECR
                    →
                    AWS EC2
                    →
                    Docker
                    →
                    Node.js
                </div>

                <div class="footer">
                    <p>Built as an AWS Infrastructure & CI/CD learning project</p>
                    <p>Created by Saurabh</p>
                </div>

            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
});