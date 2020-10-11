from django.db import models
from django.contrib.postgres.fields import JSONField

# Create your models here.


class lyric(models.Model):
    lines = JSONField(blank=True, default={})
