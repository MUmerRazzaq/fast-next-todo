# Caching Strategies in GitHub Actions for Python

Caching is crucial for speeding up your CI/CD pipelines. By caching dependencies, you avoid downloading them on every run.

## Caching Pip Dependencies

The provided `python_pr_workflow.yml` uses `actions/cache` to cache pip dependencies.

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```

### How it works:

- `path`: Specifies the directory to cache. For pip, this is `~/.cache/pip`.
- `key`: An explicit key for restoring and saving the cache. It includes the runner's OS and a hash of your `requirements.txt` file. If `requirements.txt` changes, a new cache is created.
- `restore-keys`: A list of keys to use for restoring cache if no exact match is found for `key`. This allows restoring from older caches.

## Caching for Other Package Managers

- **Poetry**:
  ```yaml
  - name: Cache Poetry dependencies
    uses: actions/cache@v3
    with:
      path: ~/.cache/pypoetry/virtualenvs
      key: ${{ runner.os }}-poetry-${{ hashFiles('**/poetry.lock') }}
      restore-keys: |
        ${{ runner.os }}-poetry-
  ```

- **Pipenv**:
  ```yaml
  - name: Cache Pipenv dependencies
    uses: actions/cache@v3
    with:
      path: ~/.local/share/virtualenvs
      key: ${{ runner.os }}-pipenv-${{ hashFiles('**/Pipfile.lock') }}
      restore-keys: |
        ${{ runner.os }}-pipenv-
  ```
