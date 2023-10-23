from db.movie_storage import MovieDB
from db.movie_dto import MovieDto
from omdb.omdb_api_client import OMDBAPIClient
from youtube.youtube_api_client import YoutubeAPIClient


class MovieAppClient:
    """class to run the movie app"""
    def __init__(self, movie_db: MovieDB):
        self._movie_db = movie_db
        self._omdb_api_client = OMDBAPIClient()
        self._youtube_api_client = YoutubeAPIClient()

    def setup(self):
        """Setting up the movie app client resources"""
        self._movie_db.setup()

    def run_new_account(self):
        """Creates new account"""
        self._movie_db.create_new_account()

    def add_movie(self, name):
        """Ask movie name which user want to add.
        If it's not in database, adds it from API loaded data"""
        name = name.capitalize()
        if not self._movie_db.is_movie_exist(name):
            omdb_movie_dto = self._omdb_api_client.get_omdb_movie(name)
            try:
                trailer_dto = self._youtube_api_client.get_trailer(f"{omdb_movie_dto.name} {omdb_movie_dto.year}")
            except AttributeError:
                return False
            if omdb_movie_dto and trailer_dto:
                self._movie_db.upsert(MovieDto(
                    name=omdb_movie_dto.name,
                    rating=omdb_movie_dto.rating,
                    year=omdb_movie_dto.year,
                    director=omdb_movie_dto.director,
                    poster=omdb_movie_dto.poster,
                    trailer_id=trailer_dto.trailer_id,
                ))
                return True
        return False

    def get_all_movies(self):
        """prints all movie's in database"""
        return self._movie_db.get_movies()

    def delete_movie(self, name):
        """Ask movie name from user and delete it if exists"""
        if self._movie_db.is_movie_exist(name):
            self._movie_db.delete(name.title())
            return True
        return False

    def update_movie(self, name, note):
        """Add user's description if movie exists"""
        movie = self._movie_db.get_movie(name)
        if movie:
            movie.note = note
            self._movie_db.upsert(movie)
            return True
        return False

