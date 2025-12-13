# Faker Data Generation Examples

This document provides examples of how to use the [Faker](https://faker.readthedocs.io/) library to generate various types of realistic data.

## Basic Usage

First, install the library:
```bash
pip install Faker
```

Then, import and initialize the `Faker` generator:
```python
from faker import Faker
fake = Faker()

# For reproducible data, seed the generator
Faker.seed(0)
```

## Generating Common Data Types

### People
```python
fake.name()         # 'John Doe'
fake.first_name()   # 'John'
fake.last_name()    # 'Doe'
```

### Addresses
```python
fake.address()      # '42628 Kimberly Bypass Suite 293\nNorth Joseph, WI 26829'
fake.street_address() # '83942 Baker Drives'
fake.city()         # 'South Daniel'
fake.zipcode()      # '49629'
fake.country()      # 'United States of America'
```

### Text
```python
fake.sentence()     # 'Laboriosam non ut debitis quae.'
fake.paragraph()    # 'Quo eius quia...'
fake.text()         # 'Voluptas ed...'
```

### Emails and Usernames
```python
fake.email()        # 'michael.smith@example.com'
fake.user_name()    # 'christopher23'
```

### Passwords
```python
fake.password(length=12, special_chars=True, digits=True, upper_case=True, lower_case=True)
# 'eH9$lP3!aK1"'
```

### Dates and Times
```python
fake.date_of_birth(minimum_age=18, maximum_age=65) # datetime.date(1986, 7, 13)
fake.date_between(start_date='-30d', end_date='today') # datetime.date(2025, 11, 28)
fake.iso8601()      # '2008-05-29T13:42:04'
```

### Numbers
```python
fake.random_int(min=0, max=9999) # 4312
fake.pyfloat(left_digits=3, right_digits=2, positive=True) # 451.21
```

### Internet
```python
fake.ipv4()         # '192.168.1.1'
fake.url()          # 'http://www.gonzalez-peters.com/'
```

## Localization

Faker supports multiple locales.

```python
fake_es = Faker('es_ES')
print(fake_es.name()) # 'Sr. Ismael Vaca Vaca'
```
