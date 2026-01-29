from django.db import models

# Model to store summary statistics of uploaded equipment data
# What is a Django Model?
# A model is:
# A Python class that represents a database table.
# Each object of the class = one row in the table.
# You do not write SQL.
# Django writes SQL for you.

class UploadRecord(models.Model):
    uploaded_at = models.DateTimeField(auto_now_add=True)
    total_equipment = models.IntegerField()
    average_flowrate = models.FloatField()
    average_pressure = models.FloatField()
    average_temperature = models.FloatField()
    equipment_type_distribution = models.JSONField()

    def __str__(self):
        return f"Upload at {self.uploaded_at}"
