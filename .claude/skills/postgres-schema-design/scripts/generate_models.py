#!/usr/bin/env python3
"""
SQLModel Schema Generator for PostgreSQL

Generates SQLModel model classes from a schema definition.
Supports UUID/integer primary keys, relationships, timestamps, and soft deletes.

Usage:
    python generate_models.py --output models.py
    python generate_models.py --config schema.yaml --output models.py
"""

import argparse
from datetime import datetime
from pathlib import Path
from textwrap import dedent, indent


def generate_imports() -> str:
    """Generate standard imports for SQLModel."""
    return dedent("""\
        from __future__ import annotations

        import uuid
        from datetime import datetime
        from typing import Optional

        from sqlmodel import Field, Relationship, SQLModel
    """)


def generate_timestamp_mixin() -> str:
    """Generate timestamp mixin class."""
    return dedent("""\


        class TimestampMixin(SQLModel):
            \"\"\"Mixin for created_at and updated_at timestamps.\"\"\"
            created_at: datetime = Field(default_factory=datetime.utcnow)
            updated_at: datetime = Field(default_factory=datetime.utcnow)
    """)


def generate_soft_delete_mixin() -> str:
    """Generate soft delete mixin class."""
    return dedent("""\


        class SoftDeleteMixin(SQLModel):
            \"\"\"Mixin for soft delete functionality.\"\"\"
            deleted_at: datetime | None = Field(default=None, index=True)

            @property
            def is_deleted(self) -> bool:
                return self.deleted_at is not None
    """)


def generate_base_model(
    name: str,
    fields: list[dict],
    doc: str = ""
) -> str:
    """Generate a base model class (no table)."""
    lines = [f"\n\nclass {name}Base(SQLModel):"]
    if doc:
        lines.append(f'    """{doc}"""')

    for field in fields:
        field_def = generate_field_definition(field)
        lines.append(f"    {field_def}")

    if len(lines) == 1:
        lines.append("    pass")

    return "\n".join(lines)


def generate_table_model(
    name: str,
    pk_type: str = "uuid",
    mixins: list[str] = None,
    relationships: list[dict] = None
) -> str:
    """Generate a table model class."""
    mixins = mixins or []
    relationships = relationships or []

    # Build inheritance
    bases = [f"{name}Base"]
    if "timestamp" in mixins:
        bases.append("TimestampMixin")
    if "soft_delete" in mixins:
        bases.append("SoftDeleteMixin")

    inheritance = ", ".join(bases)

    lines = [f"\n\nclass {name}({inheritance}, table=True):"]
    lines.append(f'    """Database table model for {name}."""')

    # Primary key
    if pk_type == "uuid":
        lines.append("    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)")
    else:
        lines.append("    id: int | None = Field(default=None, primary_key=True)")

    # Relationships
    for rel in relationships:
        rel_def = generate_relationship_definition(rel)
        lines.append(f"    {rel_def}")

    return "\n".join(lines)


def generate_field_definition(field: dict) -> str:
    """Generate a single field definition."""
    name = field["name"]
    type_ = field.get("type", "str")
    nullable = field.get("nullable", False)
    default = field.get("default")
    index = field.get("index", False)
    unique = field.get("unique", False)
    foreign_key = field.get("foreign_key")

    # Build type annotation
    if nullable:
        type_annotation = f"{type_} | None"
    else:
        type_annotation = type_

    # Build Field() arguments
    field_args = []

    if default is not None:
        if isinstance(default, str):
            field_args.append(f'default="{default}"')
        else:
            field_args.append(f"default={default}")
    elif nullable:
        field_args.append("default=None")

    if index:
        field_args.append("index=True")
    if unique:
        field_args.append("unique=True")
    if foreign_key:
        field_args.append(f'foreign_key="{foreign_key}"')

    # Build final definition
    if field_args:
        return f'{name}: {type_annotation} = Field({", ".join(field_args)})'
    else:
        return f"{name}: {type_annotation}"


def generate_relationship_definition(rel: dict) -> str:
    """Generate a relationship definition."""
    name = rel["name"]
    type_ = rel["type"]
    back_populates = rel.get("back_populates")
    link_model = rel.get("link_model")

    args = []
    if back_populates:
        args.append(f'back_populates="{back_populates}"')
    if link_model:
        args.append(f"link_model={link_model}")

    args_str = ", ".join(args)
    return f'{name}: {type_} = Relationship({args_str})'


def generate_crud_models(name: str, fields: list[dict]) -> str:
    """Generate Create, Update, and Public model variants."""
    lines = []

    # Create model
    lines.append(f"\n\nclass {name}Create({name}Base):")
    lines.append("    pass")

    # Update model (all fields optional)
    lines.append(f"\n\nclass {name}Update(SQLModel):")
    for field in fields:
        field_name = field["name"]
        field_type = field.get("type", "str")
        lines.append(f"    {field_name}: {field_type} | None = None")
    if not fields:
        lines.append("    pass")

    # Public model (for API responses)
    lines.append(f"\n\nclass {name}Public({name}Base):")
    lines.append("    id: uuid.UUID | int")

    return "\n".join(lines)


def generate_link_model(
    model1: str,
    model2: str,
    extra_fields: list[dict] = None
) -> str:
    """Generate a many-to-many link model."""
    extra_fields = extra_fields or []

    table1 = model1.lower()
    table2 = model2.lower()

    lines = [f"\n\nclass {model1}{model2}Link(SQLModel, table=True):"]
    lines.append(f'    """Link table for {model1} and {model2} many-to-many relationship."""')
    lines.append(f'    {table1}_id: uuid.UUID | None = Field(default=None, foreign_key="{table1}.id", primary_key=True)')
    lines.append(f'    {table2}_id: uuid.UUID | None = Field(default=None, foreign_key="{table2}.id", primary_key=True)')

    for field in extra_fields:
        field_def = generate_field_definition(field)
        lines.append(f"    {field_def}")

    return "\n".join(lines)


def generate_example_schema() -> str:
    """Generate a complete example schema."""
    output = []

    # Imports
    output.append(generate_imports())

    # Mixins
    output.append(generate_timestamp_mixin())
    output.append(generate_soft_delete_mixin())

    # User model
    user_fields = [
        {"name": "email", "type": "str", "index": True, "unique": True},
        {"name": "name", "type": "str", "index": True},
        {"name": "password_hash", "type": "str"},
        {"name": "is_active", "type": "bool", "default": True},
    ]
    output.append(generate_base_model("User", user_fields, "User account information"))
    output.append(generate_table_model(
        "User",
        pk_type="uuid",
        mixins=["timestamp", "soft_delete"],
        relationships=[
            {"name": "posts", "type": 'list["Post"]', "back_populates": "author"},
            {"name": "roles", "type": 'list["Role"]', "back_populates": "users", "link_model": "UserRoleLink"},
        ]
    ))
    output.append(generate_crud_models("User", user_fields))

    # Role model
    role_fields = [
        {"name": "name", "type": "str", "unique": True},
        {"name": "description", "type": "str", "nullable": True},
    ]
    output.append(generate_base_model("Role", role_fields, "User roles for authorization"))
    output.append(generate_table_model(
        "Role",
        pk_type="uuid",
        mixins=["timestamp"],
        relationships=[
            {"name": "users", "type": 'list["User"]', "back_populates": "roles", "link_model": "UserRoleLink"},
        ]
    ))

    # User-Role Link
    output.append(generate_link_model("User", "Role", [
        {"name": "assigned_at", "type": "datetime", "default": "datetime.utcnow"}
    ]))

    # Post model
    post_fields = [
        {"name": "title", "type": "str", "index": True},
        {"name": "content", "type": "str"},
        {"name": "status", "type": "str", "default": "draft", "index": True},
        {"name": "author_id", "type": "uuid.UUID", "foreign_key": "user.id", "index": True},
    ]
    output.append(generate_base_model("Post", post_fields, "Blog post content"))
    output.append(generate_table_model(
        "Post",
        pk_type="uuid",
        mixins=["timestamp", "soft_delete"],
        relationships=[
            {"name": "author", "type": 'User | None', "back_populates": "posts"},
        ]
    ))
    output.append(generate_crud_models("Post", post_fields))

    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(
        description="Generate SQLModel schema for PostgreSQL"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default="models.py",
        help="Output file path (default: models.py)"
    )
    parser.add_argument(
        "--example",
        action="store_true",
        help="Generate example schema with User, Role, Post models"
    )

    args = parser.parse_args()

    if args.example:
        schema = generate_example_schema()
    else:
        # Generate minimal template
        schema = generate_imports()
        schema += generate_timestamp_mixin()
        schema += generate_soft_delete_mixin()
        schema += "\n\n# Define your models below\n"
        schema += dedent("""\

            class ExampleBase(SQLModel):
                \"\"\"Base fields for Example model.\"\"\"
                name: str = Field(index=True)
                description: str | None = Field(default=None)


            class Example(ExampleBase, TimestampMixin, table=True):
                \"\"\"Example table model.\"\"\"
                id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
        """)

    output_path = Path(args.output)
    output_path.write_text(schema)
    print(f"Generated SQLModel schema: {output_path.absolute()}")


if __name__ == "__main__":
    main()
