# Generated by Django 3.1.1 on 2020-09-21 21:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sounds', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sound',
            name='title',
            field=models.CharField(default='', max_length=50),
        ),
    ]
