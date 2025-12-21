# Notion Database Setup Guide

Maximize visibility and analysis efficiency with this recommended property layout.

## 📋 Recommended Property Order

Arrange columns in your Notion Table View in this exact order:

| #   | Property Name    | Type           | Description                                |
| --- | ---------------- | -------------- | ------------------------------------------ |
| 1   | **Name**         | `Title`        | Company Name (e.g., Google)                |
| 2   | **Status**       | `Select`       | Hiring progress (e.g., Searching, Applied) |
| 3   | **Match**        | `Select`       | Skill match (◎, ○, △, ×)                   |
| 4   | **Rating**       | `Select`       | Overall rating (⭐⭐⭐)                       |
| 5   | **Employment**   | `Select`       | Full-time, Contract, etc.                  |
| 6   | **Remote**       | `Select`       | Remote work availability                   |
| 7   | **Salary (Min)** | `Number`       | Min Annual Salary (Ten Thousand Yen)       |
| 8   | **Salary (Max)** | `Number`       | Max Annual Salary (Ten Thousand Yen)       |
| 9   | **Job Title**    | `Rich Text`    | Specific role title                        |
| 10  | **Location**     | `Rich Text`    | Main work location                         |
| 11  | **Employees**    | `Number`       | Employee count (Approx.)                   |
| 12  | **Avg Age**      | `Number`       | Average employee age                       |
| 13  | **Skills**       | `Multi-select` | Extracted skills                           |
| 14  | **Autonomy**     | `Checkbox`     | Discretion flag                            |
| 15  | **Teamwork**     | `Checkbox`     | Cooperative culture flag                   |
| 16  | **Overwork**     | `Checkbox`     | Long hours warning                         |
| 17  | **URL**          | `URL`          | Link to job post                           |

## ⚙️ How to Add New Properties
Since the API cannot create database columns, please add these manually in Notion:

1.  Open your Notion Database.
2.  Click `+` to add a property.
3.  Name: `employees_count`, Type: `Number`
4.  Name: `average_age`, Type: `Number`
