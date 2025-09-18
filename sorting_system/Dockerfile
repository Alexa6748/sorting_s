FROM python:3.10-slim

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=sorting_system.settings

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libgomp1 \
        libsm6 \
        libxext6 \
        libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements-docker.txt /app/requirements.txt

RUN pip install --upgrade pip \
    && pip install torch==2.0.1+cpu torchvision==0.15.2+cpu -f https://download.pytorch.org/whl/torch_stable.html \
    && pip install -r requirements.txt \
    && pip uninstall numpy -y \
    && pip install numpy==1.24.3

# Copy application files
COPY manage.py /app/
COPY sorting_system/ /app/sorting_system/
COPY api/ /app/api/
COPY classification/ /app/classification/
COPY core/ /app/core/
COPY detection/ /app/detection/
COPY monitoring/ /app/monitoring/
COPY startup.sh /app/startup.sh
COPY .gitattributes /app/
COPY .coveragerc /app/
COPY pytest.ini /app/

# Create media directories and set ownership
RUN mkdir -p media/uploads media/debug \
    && chown -R appuser:appuser /app \
    && chmod +x /app/startup.sh

# Switch to non-root user
USER appuser

EXPOSE 8000

CMD ["/app/startup.sh"]