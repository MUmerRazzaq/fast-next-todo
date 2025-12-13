import logging.config
import sys


def get_logging_config(log_level: str = "INFO") -> dict:
    """
    Returns a dictionary for logging configuration.
    Uses a structured JSON formatter for machine-readable logs.
    """
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "format": "%(asctime)s %(levelname)s %(name)s %(module)s %(funcName)s %(lineno)d %(message)s",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "json",
            },
        },
        "loggers": {
            "root": {
                "handlers": ["console"],
                "level": log_level.upper(),
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "uvicorn.error": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
        },
    }


def setup_logging(log_level: str = "INFO"):
    """Applies the logging configuration."""
    config = get_logging_config(log_level)
    logging.config.dictConfig(config)
