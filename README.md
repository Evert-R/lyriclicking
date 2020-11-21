# Lyriclicking
## Lyric writing tool and private social platform for vocalists
### Coded by Evert Rot

This is a work in progress and at this moment far from finished.

##### Deployed preview version:
- [Lyric Licking](https://www.lyriclicking.nl)
    - Running on Ubuntu server on a Raspberry pi4 with gunicorn and nginx

## Project purpose
Lyric licking, referring to a lick from a guitarist, is designed to provide a private workspace for vocalists to write lyrics together for a music track and have a discussion about each line.  

## Features
- Display of the track as a waveform
- Control section with audio controls
- Switching Play/pause button
- Stop button
- Skip back/forward with adjustable range from 1ms to 100000 ms
  - In lyric edit these are used to finetune the startposition of the lyric

- Lyric scolling, so you can see what the next lyric is gonna be
- Prominent display of the current lyric
- Add a line to a lyric
- Edit a lyric's position
- Edit a lyric's text 

#### Features to be implemented before release
- Set lyric endpoint
- Delete Lyric

## Data structure
```
### lyric (json)
{ 1: {
    'line': '<Lyric text>,
    'user': <pk>,
    'date': <date>, 
}}
```

## Technologies Used
- [VSCode](https://code.visualstudio.com)
  - Code Editor
- [Git bash](https://gitforwindows.org)
  - Version control from windows
- [Python 3.8.1](https://www.python.org)
  - Program language
- [wavesurferJS](https://wavesurfer-js.org/)
  - Displaying audio waveform
- [Django 3.0.7](https://www.djangoproject.com)
  - Web framework
- [Bootstrap 4.4.1](https://getbootstrap.com/)
  - Grid layout, navigation bar & card columns
- [Jquery 3.4.1](https://jquery.com/)
  - DOM manipulation
- [Font awesome 5.13.0](https://fontawesome.com/)
  - Icon library
- [Dj-database-url](https://pypi.org/project/dj-database-url)
  - Parse django database urls
- [psycopg2](https://pypi.org/project/psycopg2)
  - Connnect to progresql database
- [Gunicorn](https://gunicorn.org)
  - Run django app on Heroku server 
- [Django secret key generator](https://miniwebtool.com/django-secret-key-generator/)
  - Generate secret key 
- [Autoprefixer](https://autoprefixer.github.io)
    - CSS prefixes for different browsers 
- [Online-convert](https://image.online-convert.com/convert-to-ico)
    - Convert jpg image to ico for favicon
- [SQL database diagram](https://app.sqldbm.com/)
    - Draw SQL database design


## Credits
- Update postgres database without refreshing the page
    - https://realpython.com/django-and-ajax-form-submissions/
