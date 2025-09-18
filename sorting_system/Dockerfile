FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=sorting_system.settings

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libgomp1 \
        libsm6 \
        libxext6 \
        libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-docker.txt /app/requirements.txt

RUN pip install --upgrade pip \
    && pip install torch==2.0.1+cpu torchvision==0.15.2+cpu -f https://download.pytorch.org/whl/torch_stable.html \
    && pip install -r requirements.txt \
    && pip uninstall numpy -y \
    && pip install numpy==1.24.3

COPY . /app/

RUN mkdir -p media/uploads media/debug

EXPOSE 8000

CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000