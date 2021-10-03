# Generated by Django 3.2.4 on 2021-07-07 04:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task_master_app', '0008_merge_0007_auto_20210630_1730_0007_auto_20210630_2011'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='state',
            field=models.CharField(choices=[('Not Started', 'NOT STARTED'), ('In Progress', 'IN PROGRESS'), ('Blocked', 'BLOCKED'), ('Completed', 'COMPLETED')], default='Not Started', max_length=200),
        ),
    ]
