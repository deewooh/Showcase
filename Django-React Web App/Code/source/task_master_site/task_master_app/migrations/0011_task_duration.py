# Generated by Django 3.2.4 on 2021-07-14 14:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task_master_app', '0010_alter_connection_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='duration',
            field=models.IntegerField(default=0),
        ),
    ]
