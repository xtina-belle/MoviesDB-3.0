import json


class Users:
    def __init__(self, users_db):
        self._users = []
        self._users_db = users_db

    def setup(self):
        """Loads data from storage"""
        with open(self._users_db, "r", encoding="utf-8") as file:
            self._users = (json.load(file))

    def _flush_data(self):
        """Saves data to storage"""
        with open(self._users_db, "w", encoding="utf-8") as file:
            json.dump(self._users, file, indent=3)

    def get_users(self):
        """:returns lst: of user's names"""
        return [user["name"] for user in self._users]

    def check_user(self, name, pwd) -> dict:
        """:returns: user info"""
        for user in self._users:
            if user["name"] == name:
                if user["pwd"] == pwd:
                    return user
                raise ValueError("Invalid password!")
        raise Exception("User not found")

    def add_user(self, name, pwd):
        """Add new user account to system"""
        for user in self._users:
            if name == user["name"]:
                raise ValueError("This name is already taken")
        self._users.append({"name": name, "pwd": pwd})
        self._flush_data()
        return True

    def delete_user(self, name, pwd) -> bool:
        """Deletes user"""
        user = self.check_user(name, pwd)
        if not user:
            return False
        self._users.remove(user)
        self._flush_data()
        return True
