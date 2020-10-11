from django.shortcuts import render
from sounds.models import sound
from lyrics.models import lyric

# Create your views here.


def work_space(request):
    this_lyric = lyric.objects.first()

    try:
        this_sound = sound.objects.first()
    except:
        return render(request, "workspace.html")
    return render(request, "workspace.html", {
        "sound": this_sound,
        "lyric": this_lyric
    })
