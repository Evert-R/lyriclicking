from django.shortcuts import render
from sounds.models import sound

# Create your views here.


def work_space(request):
    try:
        this_sound = sound.objects.first()
    except:
        return render(request, "workspace.html")
    return render(request, "workspace.html", {"sound": this_sound})
