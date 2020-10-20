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
    if request.method == 'POST':
        this_line = request.POST.get('new_line')
        split_line = this_line.split(': ', 2)
        add_line = {int(split_line[0]): {
            'line': split_line[1],
            'user': '1',
            'date': '',
        }}
        this_lyric.lines[int(split_line[0])] = {
            'line': split_line[1],
            'user': 1,
            'date': now,
        }
        this_lyric.save()

        response_data = {'position': int(split_line[0]),
                         'line': split_line[1]}

        return HttpResponse(
            json.dumps(response_data),
            content_type="application/json"
        )
    else:
        return HttpResponse(
            json.dumps({"nothing to see": "this isn't happening"}),
            content_type="application/json"
        )
