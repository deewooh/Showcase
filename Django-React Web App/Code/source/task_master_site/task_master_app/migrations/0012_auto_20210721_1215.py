# Generated by Django 3.2.4 on 2021-07-21 02:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task_master_app', '0011_task_duration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='description',
            field=models.TextField(max_length=200),
        ),
        migrations.AlterField(
            model_name='task',
            name='duration',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='task',
            name='state',
            field=models.CharField(choices=[('Not Started', 'Not Started'), ('In Progress', 'In Progress'), ('Blocked', 'Blocked'), ('Completed', 'Completed')], default='Not Started', max_length=200),
        ),
    ]