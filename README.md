# Telegram survey bot

## Run container
### Prerequisities: 
Install docker, docker-compose in your system.<br>
Copy the file `.env.example` renaming it in `.env`, replace the bot key inside with the real one.


### Deploy
Run in main folder:
`docker-compose up --build -d`
<br>Running `docker logs telegram_survey_bot` you should read in the logs:<br> `Bot server started`

