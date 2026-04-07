from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("volunteer", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="volunteerassignment",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("approved", "Approved"),
                    ("suspended", "Suspended"),
                    ("rejected", "Rejected"),
                    ("completed", "Completed"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
    ]
