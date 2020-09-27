from django.db import models

# Create your models here.


class sound(models.Model):
    """
    Adding a sound to the database
    """
    title = models.CharField(max_length=50, default='')
    audio = models.FileField(upload_to="sounds/")

    def __str__(self):
        return self.title
