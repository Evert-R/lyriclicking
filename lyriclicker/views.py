from django.shortcuts import render
from sounds.models import sound
from lyrics.models import lyric

# Create your views here.


def lyric_licker(request):
    this_lyric = lyric.objects.first()

    try:
        this_sound = sound.objects.first()
    except:
        return render(request, "lyric_licker.html")
    return render(request, "lyric_licker.html", {
        "sound": this_sound,
        "lyric": this_lyric
    })
