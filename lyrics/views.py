from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from lyrics.models import lyric
import datetime

# Create your views here.


@csrf_exempt
@require_POST
def lick_lyric(request):
    """
    lick a new lyric to the rhyme
    """
    this_lyric = lyric.objects.first()
    now = str(datetime.datetime.now())

    input_position = request.POST.get('input_position')
    input_lyric = request.POST.get('input_lyric')
    input_endpoint = request.POST.get('input_endpoint')
    original_position = request.POST.get('original_position')

    if input_position != original_position and original_position != '-1':
        old_lyric = this_lyric.lines[original_position]
        this_lyric.lines[input_position] = old_lyric
        del this_lyric.lines[original_position]

    this_lyric.lines[input_position] = {
        'line': input_lyric,
        'endpoint': input_endpoint,
        'user': 1,
        'date': now,
    }
    this_lyric.save()
    return HttpResponse(status=200)


@csrf_exempt
def delete_line(request):
    """
    delete a line from the lyric
    """
    this_lyric = lyric.objects.first()
    position = request.POST.get('position')
    del this_lyric.lines[position]
    this_lyric.save()
    return HttpResponse(status=200)


@csrf_exempt
def set_endpoint(request):
    """
    set endpoint for a line
    """
    this_lyric = lyric.objects.first()
    position = request.POST.get('position')
    endpoint = request.POST.get('endpoint')
    action = request.POST.get('action')
    if action == 'set':
        this_lyric.lines[position]['endpoint'] = endpoint
        this_lyric.save()
        response_data = {'position': position,
                         'endpoint': endpoint
                         }
    elif action == 'unset':
        this_lyric.lines[position]['endpoint'] = position
        this_lyric.save()
        response_data = {'position': position,
                         'endpoint': -1
                         }
    else:
        response_data = {'error': 'Action not recognized'}
    return HttpResponse(
        json.dumps(response_data),
        content_type="application/json"
    )
