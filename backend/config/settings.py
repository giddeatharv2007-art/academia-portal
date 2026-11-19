"""
Academia Portal - Django Settings
PostgreSQL / pgAdmin4 — host: localhost, port: 5432, db: Edunexus
"""
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Load .env ────────────────────────────────────────────────────────────────
try:
    import environ
    env = environ.Env(DEBUG=(bool, True))
    _env_file = BASE_DIR / '.env'
    if _env_file.exists():
        environ.Env.read_env(str(_env_file))
    def _get(key, default=None):
        return env(key, default=default)
    def _get_bool(key, default=True):
        return env.bool(key, default=default)
    def _get_int(key, default=0):
        return env.int(key, default=default)
except ImportError:
    def _get(key, default=None):
        return os.environ.get(key, default)
    def _get_bool(key, default=True):
        return os.environ.get(key, str(default)).lower() in ('true', '1', 'yes')
    def _get_int(key, default=0):
        try:
            return int(os.environ.get(key, default))
        except Exception:
            return default

# ─── Core ────────────────────────────────────────────────────────────────────
SECRET_KEY = _get('SECRET_KEY', 'academia-portal-secret-key-2024')
DEBUG       = _get_bool('DEBUG', True)
ALLOWED_HOSTS = _get('ALLOWED_HOSTS', 'localhost,127.0.0.1,*').split(',')

# ─── Installed Apps ──────────────────────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
]

try:
    import drf_spectacular          # optional
    THIRD_PARTY_APPS.append('drf_spectacular')
    HAS_SPECTACULAR = True
except ImportError:
    HAS_SPECTACULAR = False

LOCAL_APPS = [
    'apps.accounts',
    'apps.students',
    'apps.companies',
    'apps.colleges',
    'apps.jobs',
    'apps.skills',
    'apps.matching',
    'apps.assessments',
    'apps.interviews',
    'apps.challenges',
    'apps.analytics',
    'apps.notifications',
    'apps.badges',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ─── Middleware ───────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

try:
    import whitenoise
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
except ImportError:
    pass

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ─── Database — PostgreSQL (pgAdmin4) ────────────────────────────────────────
# Connection: localhost:5432  |  Database: Edunexus  |  User: postgres / root
DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     _get('DB_NAME',     'Edunexus'),
        'USER':     _get('DB_USER',     'postgres'),
        'PASSWORD': _get('DB_PASSWORD', 'root'),
        'HOST':     _get('DB_HOST',     'localhost'),
        'PORT':     _get('DB_PORT',     '5432'),
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}

# ─── Custom User Model ────────────────────────────────────────────────────────
AUTH_USER_MODEL = 'accounts.User'

# ─── Password Validators ──────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ─── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Asia/Kolkata'
USE_I18N = True
USE_TZ   = True

# ─── Static & Media ──────────────────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL   = _get('MEDIA_URL',  '/media/')
MEDIA_ROOT  = BASE_DIR / _get('MEDIA_ROOT', 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── Django REST Framework ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

if HAS_SPECTACULAR:
    REST_FRAMEWORK['DEFAULT_SCHEMA_CLASS'] = 'drf_spectacular.openapi.AutoSchema'

# ─── SimpleJWT ────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=_get_int('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', 60)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=_get_int('JWT_REFRESH_TOKEN_LIFETIME_DAYS', 7)),
    'ROTATE_REFRESH_TOKENS':      True,
    'BLACKLIST_AFTER_ROTATION':   True,
    'UPDATE_LAST_LOGIN':          True,
    'ALGORITHM':     'HS256',
    'SIGNING_KEY':   SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'TOKEN_OBTAIN_SERIALIZER': 'apps.accounts.serializers.CustomTokenObtainPairSerializer',
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CORS_ALLOW_CREDENTIALS = True
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True   # Permissive in dev

# ─── Email ────────────────────────────────────────────────────────────────────
# Use SMTP backend — reads credentials from .env
# Set EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend in .env to disable real sending
EMAIL_BACKEND     = _get('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST        = _get('EMAIL_HOST',         'smtp.gmail.com')
EMAIL_PORT        = _get_int('EMAIL_PORT',      587)
EMAIL_USE_TLS     = _get_bool('EMAIL_USE_TLS',  True)
EMAIL_HOST_USER   = _get('EMAIL_HOST_USER',    'edunexus45@gmail.com')
EMAIL_HOST_PASSWORD = _get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = f'EduNexus <{EMAIL_HOST_USER}>'

FRONTEND_URL = _get('FRONTEND_URL', 'http://localhost:3000')

# ─── API Docs ─────────────────────────────────────────────────────────────────
if HAS_SPECTACULAR:
    SPECTACULAR_SETTINGS = {
        'TITLE':       'Academia Portal API',
        'DESCRIPTION': 'Bridging Students, Colleges and Industry',
        'VERSION':     '1.0.0',
        'SERVE_INCLUDE_SCHEMA': False,
    }

# ─── File upload limits ───────────────────────────────────────────────────────
FILE_UPLOAD_MAX_MEMORY_SIZE   = 10 * 1024 * 1024   # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE   = 10 * 1024 * 1024
