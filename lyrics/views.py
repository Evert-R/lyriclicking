from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from lyrics.models import lyric
import datetime

# Create your views here.


@csrf_exempt
def add_line(request):
    this_lyric = lyric.objects.first()
    now = str(datetime.datetime.now())
    prev_position = -1
    if request.method == 'POST':
        original_position = request.POST.get('original_position')
        line = request.POST.get('input_line')
        position = request.POST.get('input_position')

        if position != original_position and int(original_position) != -1:
            del this_lyric.lines[original_position]
            prev_position = original_position
        this_lyric.lines[int(position)] = {
            'line': line,
            'user': 1,
            'date': now,
        }
        this_lyric.save()

        response_data = {'position': int(position),
                         'line': line,
                         'user': 1,
                         'date': now,
                         'prev_position': int(prev_position)
                         }

        return HttpResponse(
            json.dumps(response_data),
            content_type="application/json"
        )
    else:
        return HttpResponse(
            json.dumps({"nothing to see": "this isn't happening"}),
            content_type="application/json"
        )
